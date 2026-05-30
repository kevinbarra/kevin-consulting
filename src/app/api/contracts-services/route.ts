import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queryWithRLS } from '@/lib/db';
import { ContractService } from '@/types';

/**
 * GET /api/contracts-services
 * Returns contracts_services for a given client.
 *
 * Query params:
 *   - client_id (required when admin) — filter by client
 *   - active_only (optional, default: true) — return only is_active = TRUE rows
 *
 * RLS: Clients can only see their own services.
 *      Admin can see all or filter by client_id.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const { searchParams } = new URL(req.url);
    const filterClientId = searchParams.get('client_id');
    const activeOnly = searchParams.get('active_only') !== 'false'; // default true

    const services = await queryWithRLS(userId, role, async (dbClient) => {
      const params: any[] = [];
      let whereClause = '';

      if (role === 'admin') {
        if (filterClientId) {
          params.push(filterClientId);
          whereClause = `WHERE cs.client_id = $${params.length}`;
        }
        if (activeOnly) {
          whereClause += whereClause ? ' AND cs.is_active = TRUE' : 'WHERE cs.is_active = TRUE';
        }
      } else {
        // Client: always filter by their own user_id via the clients join
        params.push(userId);
        whereClause = `WHERE c.user_id = $${params.length}`;
        if (activeOnly) {
          whereClause += ' AND cs.is_active = TRUE';
        }
      }

      const res = await dbClient.query(
        `SELECT
           cs.id,
           cs.client_id,
           cs.service_name,
           cs.service_type,
           cs.total_amount,
           cs.current_balance,
           cs.is_active,
           cs.created_at,
           c.business_name,
           c.legal_name
         FROM contracts_services cs
         JOIN clients c ON cs.client_id = c.id
         ${whereClause}
         ORDER BY cs.created_at DESC`,
        params
      );
      return res.rows;
    });

    // Serialize numeric fields
    const formatted: ContractService[] = services.map((s) => ({
      id: s.id,
      client_id: s.client_id,
      service_name: s.service_name,
      service_type: s.service_type,
      total_amount: parseFloat(s.total_amount),
      current_balance: parseFloat(s.current_balance),
      is_active: s.is_active,
      created_at: s.created_at,
      // Extra metadata for the UI dropdown
      business_name: s.business_name,
      legal_name: s.legal_name,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[GET /api/contracts-services] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/contracts-services
 * Restrict to: Admin
 * Registers a new service/project contract for a client.
 *
 * Body: { client_id, service_name, service_type, total_amount }
 * - current_balance defaults to total_amount (full balance pending collection)
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
    const { client_id, service_name, service_type, total_amount } = body;

    if (!client_id || !service_name || !service_type || total_amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required parameters: client_id, service_name, service_type, total_amount' },
        { status: 400 }
      );
    }

    const allowedServiceTypes = ['recurrente', 'instalacion_proyecto'];
    if (!allowedServiceTypes.includes(service_type)) {
      return NextResponse.json(
        { error: `Invalid service_type. Must be one of: ${allowedServiceTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const numericTotal = parseFloat(total_amount);
    if (isNaN(numericTotal) || numericTotal < 0) {
      return NextResponse.json({ error: 'total_amount must be a non-negative number' }, { status: 400 });
    }

    const newService = await queryWithRLS(session.user.id, 'admin', async (dbClient) => {
      // Confirm client exists
      const clientCheck = await dbClient.query('SELECT id FROM clients WHERE id = $1', [client_id]);
      if (clientCheck.rows.length === 0) {
        throw new Error('CLIENT_NOT_FOUND');
      }

      const res = await dbClient.query(
        `INSERT INTO contracts_services (client_id, service_name, service_type, total_amount, current_balance)
         VALUES ($1, $2, $3, $4::numeric, $4::numeric)
         RETURNING *`,
        [client_id, service_name, service_type, numericTotal]
      );
      return res.rows[0];
    });

    return NextResponse.json(
      { message: 'Service registered successfully', service: newService },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/contracts-services] Error:', error);
    if (error.message === 'CLIENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Bad Request: Client does not exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
