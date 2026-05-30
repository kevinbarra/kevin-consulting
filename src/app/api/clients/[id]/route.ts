import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queryWithRLS } from '@/lib/db';

type Params = Promise<{ id: string }>;

/**
 * GET /api/clients/[id]
 * Fetch a single client profile.
 * - Under RLS, clients can only query their own client record. Admins can query any.
 * - Applies fiscal switch: if fiscal_tracked = false, omits RFC details.
 */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const { id: clientId } = await params;

    const clientData = await queryWithRLS(userId, role, async (dbClient) => {
      // Defense in Depth: filter explicitly in application layer
      if (role === 'admin') {
        const res = await dbClient.query('SELECT * FROM clients WHERE id = $1', [clientId]);
        return res.rows[0];
      } else {
        const res = await dbClient.query('SELECT * FROM clients WHERE id = $1 AND user_id = $2', [clientId, userId]);
        return res.rows[0];
      }
    });

    if (!clientData) {
      return NextResponse.json({ error: 'Not Found: Client profile not found or access denied' }, { status: 404 });
    }

    // Apply the Mexican Fiscal Switch filtering
    if (!clientData.fiscal_tracked) {
      const { rfc, tax_regime, cfdi_use, postal_code, ...cleanData } = clientData;
      return NextResponse.json(cleanData);
    }

    return NextResponse.json(clientData);
  } catch (error: any) {
    console.error('Error fetching single client:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
