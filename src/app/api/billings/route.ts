import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queryWithRLS } from '@/lib/db';
import { BillingResponse } from '@/types';

// Helper to round numeric calculations to 2 decimal places (standard financial rounding)
const roundAmount = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * GET /api/billings
 * Retrieve billing items.
 * - Under RLS, clients can only query their own billings. Admins can view all.
 * - Applies Mexican tax rules:
 *   - If fiscal_tracked = false: Omits SATUUID, tax breakdowns, and returns amount as total.
 *   - If fiscal_tracked = true:
 *     - Calculates IVA (16%).
 *     - If Persona Moral (RFC length = 12 after cleansing):
 *       - Retención ISR (1.25%)
 *       - Retención IVA (10.66%)
 *       - Total = Subtotal + IVA - Retenciones
 *     - If Persona Física (RFC length = 13):
 *       - Total = Subtotal + IVA
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    
    // Optional filtering by client_id (useful for admin searches)
    const { searchParams } = new URL(req.url);
    const filterClientId = searchParams.get('client_id');

    const billings = await queryWithRLS(userId, role, async (dbClient) => {
      let queryStr = `
        SELECT b.id, b.client_id, b.concept, b.amount, b.status, 
               b.payment_form, b.bank_destination, b.sat_uuid, 
               b.due_date, b.paid_at, b.created_at,
               c.fiscal_tracked, c.rfc, c.legal_name
        FROM billings b
        JOIN clients c ON b.client_id = c.id
      `;
      const queryParams: any[] = [];

      // Defense in Depth: filter explicitly in application layer
      if (role === 'admin') {
        if (filterClientId) {
          queryStr += ` WHERE b.client_id = $1`;
          queryParams.push(filterClientId);
        }
      } else {
        queryStr += ` WHERE c.user_id = $1`;
        queryParams.push(userId);
      }

      queryStr += ` ORDER BY b.created_at DESC`;
      const res = await dbClient.query(queryStr, queryParams);
      return res.rows;
    });

    // Apply financial rules and tax switch
    const formattedBillings: BillingResponse[] = billings.map((b) => {
      const isFiscalTracked = b.fiscal_tracked;
      const subtotal = parseFloat(b.amount);

      if (!isFiscalTracked) {
        // Cash direct mode: no SAT UUID, no tax breakdowns, amount is total net
        return {
          id: b.id,
          client_id: b.client_id,
          concept: b.concept,
          status: b.status,
          due_date: b.due_date,
          paid_at: b.paid_at,
          created_at: b.created_at,
          payment_form: b.payment_form,
          bank_destination: b.bank_destination,
          fiscal_tracked: false,
          total: subtotal,
        };
      }

      // Fiscal mode: compute Mexican taxes
      const cleanedRFC = b.rfc.replace(/[\s-]/g, '').toUpperCase();
      const isPersonaMoral = cleanedRFC.length === 12;

      const iva = subtotal * 0.16;
      let retencionIsr = 0;
      let retencionIva = 0;

      if (isPersonaMoral) {
        retencionIsr = subtotal * 0.0125;  // 1.25% RESICO
        retencionIva = subtotal * 0.1066;  // 10.66% Retención IVA
      }

      const total = subtotal + iva - retencionIsr - retencionIva;

      return {
        id: b.id,
        client_id: b.client_id,
        concept: b.concept,
        status: b.status,
        due_date: b.due_date,
        paid_at: b.paid_at,
        created_at: b.created_at,
        payment_form: b.payment_form,
        bank_destination: b.bank_destination,
        fiscal_tracked: true,
        subtotal: roundAmount(subtotal),
        iva: roundAmount(iva),
        retencion_isr: isPersonaMoral ? roundAmount(retencionIsr) : undefined,
        retencion_iva: isPersonaMoral ? roundAmount(retencionIva) : undefined,
        sat_uuid: b.sat_uuid, // Explicitly typed as optional/nullable in BillingResponse
        total: roundAmount(total),
      };
    });

    return NextResponse.json(formattedBillings);
  } catch (error: any) {
    console.error('Error fetching billings:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/billings
 * Restrict to: Admin
 * Inserts a new billing/charge entry for a client.
 *
 * Balance deduction logic:
 *  - If service_id is present, status === 'pagado', service_type === 'instalacion_proyecto',
 *    AND amount > 0, then contracts_services.current_balance is decremented atomically within
 *    the same transaction (NUMERIC(12,2) precision, no negative balance).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      client_id,
      service_id,       // NEW: optional FK to contracts_services
      concept,
      amount,
      status,
      payment_form,
      bank_destination,
      sat_uuid,
      due_date,
      paid_at,
    } = body;

    // Validate required parameters
    if (!client_id || !concept || amount === undefined || !status || !due_date) {
      return NextResponse.json({ error: 'Missing required parameters: client_id, concept, amount, status, due_date' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ error: 'Amount must be a non-negative number' }, { status: 400 });
    }

    const newBilling = await queryWithRLS(session.user.id, 'admin', async (dbClient) => {
      // --- 1. Confirm target client profile exists ---
      const clientCheck = await dbClient.query('SELECT id FROM clients WHERE id = $1', [client_id]);
      if (clientCheck.rows.length === 0) {
        throw new Error('CLIENT_NOT_FOUND');
      }

      // --- 2. If a service is linked, verify it belongs to the same client ---
      let linkedServiceType: string | null = null;
      if (service_id) {
        const serviceCheck = await dbClient.query(
          'SELECT service_type FROM contracts_services WHERE id = $1 AND client_id = $2',
          [service_id, client_id]
        );
        if (serviceCheck.rows.length === 0) {
          throw new Error('SERVICE_NOT_FOUND');
        }
        linkedServiceType = serviceCheck.rows[0].service_type;
      }

      // --- 3. Determine the exact payment timestamp ---
      // Use paid_at from payload when provided; otherwise fall back to NOW() if status is 'pagado'
      const resolvedPaidAt = status === 'pagado'
        ? (paid_at || new Date().toISOString())
        : null;

      // --- 4. Insert the billing record ---
      const billingInsertRes = await dbClient.query(
        `INSERT INTO billings (
          client_id, service_id, concept, amount, status,
          payment_form, bank_destination, sat_uuid,
          due_date, paid_at, payment_date
        ) VALUES ($1, $2, $3, $4::numeric, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          client_id,
          service_id || null,
          concept,
          numericAmount,          // stored as NUMERIC(12,2) by the DB column constraint
          status,
          payment_form || null,
          bank_destination || null,
          sat_uuid || null,
          due_date,
          resolvedPaidAt,
          resolvedPaidAt,         // payment_date mirrors paid_at for conciliation purposes
        ]
      );

      const insertedBilling = billingInsertRes.rows[0];

      // --- 5. Auto-deduct balance for 'instalacion_proyecto' services ---
      // Guard clause: amount must be > 0 (user-confirmed precision requirement)
      if (
        service_id &&
        status === 'pagado' &&
        linkedServiceType === 'instalacion_proyecto' &&
        numericAmount > 0
      ) {
        await dbClient.query(
          `UPDATE contracts_services
           SET current_balance = GREATEST(0, current_balance - $1::numeric)
           WHERE id = $2
             AND client_id = $3
             AND $1::numeric > 0`,
          [numericAmount, service_id, client_id]
        );
      }

      return insertedBilling;
    });

    return NextResponse.json(
      { message: 'Billing created successfully', billing: newBilling },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/billings] Error:', error);
    if (error.message === 'CLIENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Bad Request: Selected client profile does not exist' }, { status: 400 });
    }
    if (error.message === 'SERVICE_NOT_FOUND') {
      return NextResponse.json({ error: 'Bad Request: Service does not exist or does not belong to this client' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
