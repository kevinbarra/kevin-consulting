import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queryWithRLS } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Clean and format Mexican RFC
const sanitizeRFC = (rfc: string): string => {
  return rfc.replace(/[\s-]/g, '').toUpperCase();
};

/**
 * GET /api/clients
 * Returns client profiles.
 * - If admin: returns all clients.
 * - If client: returns only the logged-in client's profile (restricted via RLS).
 * - Applies fiscal switch: if fiscal_tracked = false, omits rfc, tax_regime, cfdi_use, and postal_code.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    const { id: userId, role } = session.user;

    const clients = await queryWithRLS(userId, role, async (dbClient) => {
      // Defense in Depth: filter explicitly in application layer
      if (role === 'admin') {
        const res = await dbClient.query(`
          SELECT c.*, COALESCE(d.doc_count, 0)::int as documents_count
          FROM clients c
          LEFT JOIN (
            SELECT client_id, COUNT(*) as doc_count 
            FROM documents 
            GROUP BY client_id
          ) d ON c.id = d.client_id
          ORDER BY c.created_at DESC
        `);
        return res.rows;
      } else {
        const res = await dbClient.query(`
          SELECT c.*, COALESCE(d.doc_count, 0)::int as documents_count
          FROM clients c
          LEFT JOIN (
            SELECT client_id, COUNT(*) as doc_count 
            FROM documents 
            GROUP BY client_id
          ) d ON c.id = d.client_id
          WHERE c.user_id = $1
        `, [userId]);
        return res.rows;
      }
    });

    // Apply the Mexican Fiscal Switch filtering
    const formattedClients = clients.map((c) => {
      if (!c.fiscal_tracked) {
        // If fiscal tracking is disabled, omit RFC and Sat information, returning clean box data
        const { rfc, tax_regime, cfdi_use, postal_code, ...cleanData } = c;
        return cleanData;
      }
      return c;
    });

    return NextResponse.json(formattedClients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

/**
 * POST /api/clients
 * Restrict to: Admin
 * Manually registers a new user with 'client' role and creates the client profile.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }

    // Role check: Only admin role can register clients manually
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      email,
      password,
      business_name,
      legal_name,
      rfc,
      postal_code,
      tax_regime,
      cfdi_use,
      fiscal_tracked,
      cutoff_day,
    } = body;

    // Validation
    if (!email || !password || !business_name || !legal_name || !rfc || cutoff_day === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const cleanedRFC = sanitizeRFC(rfc);
    if (cleanedRFC.length !== 12 && cleanedRFC.length !== 13) {
      return NextResponse.json(
        { error: 'Invalid RFC: Mexican RFCs must be 12 (Moral Person) or 13 (Physical Person) characters long.' },
        { status: 400 }
      );
    }

    const numericCutoffDay = Number(cutoff_day);
    if (isNaN(numericCutoffDay) || numericCutoffDay < 1 || numericCutoffDay > 31) {
      return NextResponse.json({ error: 'Cutoff day must be between 1 and 31' }, { status: 400 });
    }

    // Execute user creation and client profile association in a transaction with admin authority
    const result = await queryWithRLS(session.user.id, 'admin', async (dbClient) => {
      // Check if user already exists
      const userCheck = await dbClient.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        throw new Error('EMAIL_TAKEN');
      }

      // Hash temporary password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create credentials
      const userRes = await dbClient.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [email, passwordHash, 'client']
      );
      const newUserId = userRes.rows[0].id;

      // Create client profile
      const clientRes = await dbClient.query(
        `INSERT INTO clients (
          user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, fiscal_tracked, cutoff_day
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          newUserId,
          business_name,
          legal_name,
          cleanedRFC,
          postal_code || '',
          tax_regime || '',
          cfdi_use || '',
          fiscal_tracked !== undefined ? fiscal_tracked : true,
          numericCutoffDay,
        ]
      );

      return clientRes.rows[0];
    });

    return NextResponse.json({ message: 'Client registered successfully', client: result }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    if (error.message === 'EMAIL_TAKEN') {
      return NextResponse.json({ error: 'Bad Request: Email is already registered' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
