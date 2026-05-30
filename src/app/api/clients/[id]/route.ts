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

/**
 * PUT /api/clients/[id]
 * Updates client profile.
 * - Under RLS, clients can only update their own profile. Admins can update any.
 */
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { id: userId, role } = session.user;
    const { id: clientId } = await params;

    const body = await req.json();
    const {
      business_name,
      legal_name,
      rfc,
      postal_code,
      tax_regime,
      cfdi_use,
    } = body;

    // Validate parameters
    if (!business_name || !legal_name || !rfc) {
      return NextResponse.json({ error: 'Missing required parameters: business_name, legal_name, rfc' }, { status: 400 });
    }

    const cleanRfc = rfc.replace(/[\s-]/g, '').toUpperCase();
    if (cleanRfc.length !== 12 && cleanRfc.length !== 13) {
      return NextResponse.json({ error: 'Invalid RFC: Mexican RFCs must be 12 or 13 characters' }, { status: 400 });
    }

    const updatedClient = await queryWithRLS(userId, role, async (dbClient) => {
      // Confirm client profile exists and user has rights under RLS
      const checkRes = await dbClient.query(
        role === 'admin' 
          ? 'SELECT id FROM clients WHERE id = $1' 
          : 'SELECT id FROM clients WHERE id = $1 AND user_id = $2',
        [clientId, userId]
      );
      if (checkRes.rows.length === 0) {
        throw new Error('CLIENT_NOT_FOUND');
      }

      const updateRes = await dbClient.query(
        `UPDATE clients
         SET business_name = $1,
             legal_name = $2,
             rfc = $3,
             postal_code = $4,
             tax_regime = $5,
             cfdi_use = $6
         WHERE id = $7
         RETURNING *`,
        [
          business_name,
          legal_name,
          cleanRfc,
          postal_code || '',
          tax_regime || '',
          cfdi_use || '',
          clientId
        ]
      );
      return updateRes.rows[0];
    });

    return NextResponse.json({ message: 'Client profile updated successfully', client: updatedClient });
  } catch (error: any) {
    console.error('Error updating client:', error);
    if (error.message === 'CLIENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Not Found: Client profile not found or access denied' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

