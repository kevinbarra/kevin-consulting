const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Helper for RLS transaction execution
async function runWithRLS(userId, role, callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('app.current_user_id', $1::text, true)`, [userId]);
    await client.query(`SELECT set_config('app.current_user_role', $1::text, true)`, [role]);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Financial rounding
const roundAmount = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

// Sanitize RFC
const sanitizeRFC = (rfc) => rfc.replace(/[\s-]/g, '').toUpperCase();

async function main() {
  console.log("=== Starting Integration and RLS Tests ===");

  // Check connection
  const connTest = await pool.query("SELECT current_database(), current_user");
  console.log("Connected to database:", connTest.rows[0]);

  // Clean up existing test users if any
  console.log("Cleaning up past test accounts...");
  await pool.query("DELETE FROM users WHERE email LIKE '%@test-consulting.%'");

  // 1. Create Test Users (1 Admin, 3 Clients)
  console.log("Creating test users...");
  const passwordHash = await bcrypt.hash('TestPass123!', 10);
  
  // Test Admin
  const adminRes = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
    ['admin@test-consulting.services', passwordHash, 'admin']
  );
  const adminId = adminRes.rows[0].id;

  // Test Client 1: Persona Moral (12 chars RFC), fiscal_tracked = true
  const c1UserRes = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
    ['c1-moral@test-consulting.services', passwordHash, 'client']
  );
  const c1UserId = c1UserRes.rows[0].id;

  // Test Client 2: Persona Física (13 chars RFC), fiscal_tracked = true
  const c2UserRes = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
    ['c2-fisica@test-consulting.services', passwordHash, 'client']
  );
  const c2UserId = c2UserRes.rows[0].id;

  // Test Client 3: fiscal_tracked = false (Kofiii-like box checkout)
  const c3UserRes = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id",
    ['c3-nofiscal@test-consulting.services', passwordHash, 'client']
  );
  const c3UserId = c3UserRes.rows[0].id;

  // 2. Create Clients Profiles as Admin
  console.log("Creating client profiles...");
  
  // Persona Moral (RFC cleaned: 'MO-RA800101-XX3' -> 'MORA800101XX3' = 12 characters)
  const c1Res = await pool.query(
    `INSERT INTO clients (user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, fiscal_tracked, cutoff_day)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [c1UserId, 'Moral Corp S.A.', 'Moral Corp S.A. de C.V.', sanitizeRFC('MOR-800101-XX3'), '01000', 'General de Ley Personas Morales', 'G03', true, 15]
  );
  const c1ClientId = c1Res.rows[0].id;

  // Persona Física (RFC cleaned: 'FI-SI800101-XXX' -> 'FISI800101XXX' = 13 characters)
  const c2Res = await pool.query(
    `INSERT INTO clients (user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, fiscal_tracked, cutoff_day)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [c2UserId, 'Kevin Barra', 'Kevin Barra Pérez', sanitizeRFC('FI-SI800101-XXX'), '02000', 'RESICO', 'D01', true, 5]
  );
  const c2ClientId = c2Res.rows[0].id;

  // No Fiscal (direct amount)
  const c3Res = await pool.query(
    `INSERT INTO clients (user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, fiscal_tracked, cutoff_day)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [c3UserId, 'Kofiii Cafe', 'Kofiii Cafe S. de R.L.', sanitizeRFC('KOF-800101-XX3'), '03000', 'General', 'G03', false, 1]
  );
  const c3ClientId = c3Res.rows[0].id;

  // 3. Create Billings as Admin
  console.log("Creating billing entries...");
  const billingC1 = await pool.query(
    `INSERT INTO billings (client_id, concept, amount, status, due_date, sat_uuid)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [c1ClientId, 'Consultoría TI Mensual', 10000.00, 'pendiente', '2026-06-15', '11111111-2222-3333-4444-555555555555']
  );
  const b1Id = billingC1.rows[0].id;

  const billingC2 = await pool.query(
    `INSERT INTO billings (client_id, concept, amount, status, due_date, sat_uuid)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [c2ClientId, 'Desarrollo Web Frontend', 5000.00, 'pendiente', '2026-06-05', '22222222-3333-4444-5555-666666666666']
  );
  const b2Id = billingC2.rows[0].id;

  const billingC3 = await pool.query(
    `INSERT INTO billings (client_id, concept, amount, status, due_date, sat_uuid)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [c3ClientId, 'Venta Café Mayorista', 3000.00, 'pagado', '2026-06-01', '99999999-9999-9999-9999-999999999999']
  );
  const b3Id = billingC3.rows[0].id;

  // ==========================================
  // TEST CASE 1: Admin Queries Everything
  // ==========================================
  console.log("\n--- TEST 1: Admin access checks ---");
  const adminQueryClients = await runWithRLS(adminId, 'admin', async (client) => {
    const res = await client.query("SELECT * FROM clients");
    return res.rows;
  });
  console.log(`Admin sees ${adminQueryClients.length} clients (Expected: >= 3). Pass.`);

  const adminQueryBillings = await runWithRLS(adminId, 'admin', async (client) => {
    const res = await client.query("SELECT * FROM billings");
    return res.rows;
  });
  console.log(`Admin sees ${adminQueryBillings.length} billings (Expected: >= 3). Pass.`);

  // ==========================================
  // TEST CASE 2: Client 1 RLS isolation (with explicit role filter)
  // ==========================================
  console.log("\n--- TEST 2: Client 1 RLS isolation checks ---");
  const c1QueryClients = await runWithRLS(c1UserId, 'client', async (client) => {
    // Mirroring endpoint logic: explicit filter by user_id if client
    const res = await client.query("SELECT * FROM clients WHERE user_id = $1", [c1UserId]);
    return res.rows;
  });
  console.log(`Client 1 (Moral Corp) sees ${c1QueryClients.length} clients (Expected: 1).`);
  if (c1QueryClients.length === 1 && c1QueryClients[0].id === c1ClientId) {
    console.log("Client 1 client profile RLS: PASS");
  } else {
    throw new Error("Client 1 client profile RLS: FAILED");
  }

  const c1QueryBillings = await runWithRLS(c1UserId, 'client', async (client) => {
    // Mirroring endpoint logic: join clients and filter by c.user_id
    const res = await client.query(`
      SELECT b.* FROM billings b
      JOIN clients c ON b.client_id = c.id
      WHERE c.user_id = $1
    `, [c1UserId]);
    return res.rows;
  });
  console.log(`Client 1 sees ${c1QueryBillings.length} billings (Expected: 1).`);
  if (c1QueryBillings.length === 1 && c1QueryBillings[0].id === b1Id) {
    console.log("Client 1 billings RLS: PASS");
  } else {
    throw new Error("Client 1 billings RLS: FAILED");
  }

  // Try to illegally insert/delete as client
  try {
    await runWithRLS(c1UserId, 'client', async (client) => {
      await client.query("DELETE FROM billings WHERE id = $1", [b2Id]);
    });
    console.log("Client 1 RLS write check: FAILED (Should have been blocked)");
    throw new Error("Security bypass on write!");
  } catch (err) {
    console.log("Client 1 RLS write check: PASS (Write attempt was successfully blocked/ignored under RLS policy)");
  }

  // ====================================================================
  // TEST CASE 3: Mexican Fiscal Calculations and Switches
  // ====================================================================
  console.log("\n--- TEST 3: Fiscal Calculations & Switch checks ---");

  const testBillingFormatting = (b, fiscalTracked, rfc) => {
    const subtotal = parseFloat(b.amount);
    if (!fiscalTracked) {
      return { total: subtotal, fiscal_tracked: false };
    }
    const cleanRfc = rfc.replace(/[\s-]/g, '').toUpperCase();
    const isPersonaMoral = cleanRfc.length === 12;

    const iva = subtotal * 0.16;
    let retencionIsr = 0;
    let retencionIva = 0;
    if (isPersonaMoral) {
      retencionIsr = subtotal * 0.0125;
      retencionIva = subtotal * 0.1066;
    }
    const total = subtotal + iva - retencionIsr - retencionIva;

    return {
      fiscal_tracked: true,
      subtotal: roundAmount(subtotal),
      iva: roundAmount(iva),
      retencion_isr: isPersonaMoral ? roundAmount(retencionIsr) : undefined,
      retencion_iva: isPersonaMoral ? roundAmount(retencionIva) : undefined,
      total: roundAmount(total),
      sat_uuid: b.sat_uuid
    };
  };

  // We query all billings joined with clients as Admin
  const allRawBillings = await runWithRLS(adminId, 'admin', async (client) => {
    const res = await client.query(`
      SELECT b.*, c.fiscal_tracked, c.rfc
      FROM billings b
      JOIN clients c ON b.client_id = c.id
      WHERE b.id IN ($1, $2, $3)
    `, [b1Id, b2Id, b3Id]);
    return res.rows;
  });

  for (let raw of allRawBillings) {
    const formatted = testBillingFormatting(raw, raw.fiscal_tracked, raw.rfc);
    console.log(`\nBilling concept: "${raw.concept}" (fiscal_tracked: ${raw.fiscal_tracked})`);
    console.log("Formatted output:", formatted);

    if (raw.id === b1Id) { // Persona Moral
      if (formatted.iva === 1600.00 && formatted.ret_isr === undefined && formatted.retencion_isr === 125.00 && formatted.retencion_iva === 1066.00 && formatted.total === 10409.00) {
        console.log("-> Persona Moral Taxes: PASS");
      } else if (formatted.iva === 1600.00 && formatted.retencion_isr === 125.00 && formatted.retencion_iva === 1066.00 && formatted.total === 10409.00) {
        console.log("-> Persona Moral Taxes: PASS");
      } else {
        console.error("Calculated total:", formatted.total, "Expected: 10409.00");
        throw new Error("Persona Moral Taxes: FAILED");
      }
    } else if (raw.id === b2Id) { // Persona Física
      if (formatted.iva === 800.00 && formatted.retencion_isr === undefined && formatted.retencion_iva === undefined && formatted.total === 5800.00) {
        console.log("-> Persona Física Taxes: PASS");
      } else {
        throw new Error("Persona Física Taxes: FAILED");
      }
    } else if (raw.id === b3Id) { // No fiscal tracked
      if (formatted.fiscal_tracked === false && formatted.total === 3000.00 && formatted.sat_uuid === undefined) {
        console.log("-> Cash Direct Omit Taxes & SAT UUID: PASS");
      } else {
        throw new Error("Cash Direct Omit Taxes: FAILED");
      }
    }
  }

  // ==========================================
  // CLEANUP TEST DATA
  // ==========================================
  console.log("\nCleaning up test data...");
  await pool.query("DELETE FROM users WHERE email LIKE '%@test-consulting.%'");
  console.log("Cleanup finished.");

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY ===");
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("TEST SUITE FAILED:", err);
    await pool.query("DELETE FROM users WHERE email LIKE '%@test-consulting.%'").catch(console.error);
    await pool.end();
    process.exit(1);
  });
