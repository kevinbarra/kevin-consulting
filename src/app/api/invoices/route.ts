import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queryWithRLS } from '@/lib/db';
import crypto from 'crypto';
import { InvoiceResponse } from '@/types';

// Helper to round amounts to 2 decimal places (financial rounding)
const round = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

/**
 * Generates the internal invoice signature.
 * Format: kc_internal_sec_[billing_id_first8]_[timestamp_hex]_verify_sha256
 * This is a deterministic HMAC-SHA256 derived token using the billing_id + secret.
 */
function generateInternalSignature(billingId: string): string {
  const secret = process.env.INTERNAL_INVOICE_SECRET || 'kc_fallback_secret_2025';
  const prefix = billingId.replace(/-/g, '').substring(0, 8).toUpperCase();
  const timestampHex = Date.now().toString(16).toUpperCase();
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${billingId}:${timestampHex}`)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();
  return `kc_internal_sec_${prefix}_${hmac}_verify_sha256`;
}

/**
 * GET /api/invoices?billing_id=...
 *
 * Implements the conditional receipt switch:
 *
 * Case A — fiscal_tracked = TRUE + sat_uuid present:
 *   Returns full SAT data (RFC, retenciones, totals) for the frontend to display/download XML.
 *
 * Case B — fiscal_tracked = TRUE + sat_uuid missing:
 *   Returns HTTP 200 with { status: "processing_sat" } so the frontend can display the
 *   premium "Pago recibido. Factura pendiente de timbrado por el administrador" message.
 *   No partial comprobante is generated.
 *
 * Case C — fiscal_tracked = FALSE:
 *   Returns the internal JSON receipt payload with a digital signature
 *   (kc_internal_sec_...) to feed the existing frontend Modal. No server PDF.
 *
 * Security: RLS ensures clients can only request invoices for their own billings.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const { searchParams } = new URL(req.url);
    const billingId = searchParams.get('billing_id');

    if (!billingId) {
      return NextResponse.json({ error: 'Missing required query parameter: billing_id' }, { status: 400 });
    }

    // Validate UUID format before hitting DB
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(billingId)) {
      return NextResponse.json({ error: 'Invalid billing_id format' }, { status: 400 });
    }

    const row = await queryWithRLS(userId, role, async (dbClient) => {
      // JOIN billings → clients to access fiscal_tracked, RFC, and business metadata
      const res = await dbClient.query(
        `SELECT
           b.id                 AS billing_id,
           b.concept,
           b.amount,
           b.status,
           b.sat_uuid,
           b.paid_at,
           b.payment_date,
           c.id                 AS client_id,
           c.fiscal_tracked,
           c.rfc,
           c.legal_name,
           c.business_name
         FROM billings b
         JOIN clients c ON b.client_id = c.id
         WHERE b.id = $1
         ${role === 'client' ? 'AND c.user_id = $2' : ''}`,
        role === 'client' ? [billingId, userId] : [billingId]
      );
      return res.rows[0] ?? null;
    });

    if (!row) {
      return NextResponse.json({ error: 'Not Found: Billing record not found or access denied' }, { status: 404 });
    }

    const subtotal = parseFloat(row.amount);
    const isFiscal: boolean = row.fiscal_tracked;

    // ─── CASE C: Non-fiscal client ─────────────────────────────────────────────
    if (!isFiscal) {
      const paymentDate = row.payment_date ?? row.paid_at ?? new Date().toISOString();
      const signature = generateInternalSignature(row.billing_id);

      const payload: InvoiceResponse = {
        status: 'ok',
        billing_id: row.billing_id,
        fiscal_tracked: false,
        internal_receipt: {
          signature,
          concept: row.concept,
          amount: round(subtotal),
          payment_date: paymentDate,
          issued_to: row.business_name,
          issued_by: 'Kevin Consulting',
          billing_id: row.billing_id,
        },
      };
      return NextResponse.json(payload);
    }

    // ─── CASE B: Fiscal client, SAT UUID not yet stamped ──────────────────────
    if (!row.sat_uuid) {
      const payload: InvoiceResponse = {
        status: 'processing_sat',
        billing_id: row.billing_id,
        fiscal_tracked: true,
        message: 'Pago recibido. Factura pendiente de timbrado por el administrador.',
      };
      return NextResponse.json(payload);  // HTTP 200 with status flag (no partial PDF)
    }

    // ─── CASE A: Fiscal client, SAT UUID present ───────────────────────────────
    const cleanedRFC = row.rfc.replace(/[\s-]/g, '').toUpperCase();
    const isPersonaMoral = cleanedRFC.length === 12;

    const iva = round(subtotal * 0.16);
    const retencionIsr = isPersonaMoral ? round(subtotal * 0.0125) : 0;
    const retencionIva = isPersonaMoral ? round(subtotal * 0.1066) : 0;
    const total = round(subtotal + iva - retencionIsr - retencionIva);

    const payload: InvoiceResponse = {
      status: 'ok',
      billing_id: row.billing_id,
      fiscal_tracked: true,
      sat_data: {
        sat_uuid: row.sat_uuid,
        rfc: cleanedRFC,
        legal_name: row.legal_name,
        subtotal: round(subtotal),
        iva,
        ...(isPersonaMoral && {
          retencion_isr: retencionIsr,
          retencion_iva: retencionIva,
        }),
        total,
      },
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('[GET /api/invoices] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
