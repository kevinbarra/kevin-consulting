/**
 * =============================================================================
 * KEVIN CONSULTING - SCRIPT DE SEEDING DE PRODUCCIÓN
 * =============================================================================
 * Pobla la base de datos Neon con los 3 clientes reales de producción y
 * su cobranza histórica de Mayo 2026 en Pesos Mexicanos (MXN).
 *
 * INSTRUCCIONES DE USO:
 *   npx tsx src/db/seed.ts
 *
 * PRECAUCIÓN: Este script es IDEMPOTENTE — elimina los registros anteriores
 * con los mismos correos antes de insertar para evitar duplicados.
 * =============================================================================
 */

import path from 'path';
import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE CONEXIÓN
// ─────────────────────────────────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ Error crítico: DATABASE_URL no está definida en .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE PRODUCCIÓN (MXN — Normalizados al centavo)
// ─────────────────────────────────────────────────────────────────────────────

/** Clientes de producción */
const CLIENTS = [
  {
    email: 'manuel@fulanosbarber.com',
    password: 'Barber2026!',
    business_name: 'Manuel Fulanos Barber',
    legal_name: 'MANUEL FULANOS',
    // RFC de 12 chars = Persona Moral; de 13 = Persona Física.
    // fiscal_tracked = false → no requiere RFC real, usamos genérico de Público General.
    rfc: 'XAXX010101000',  // RFC genérico SAT para no contribuyentes (13 chars)
    postal_code: '00000',
    tax_regime: '616 - Sin obligaciones fiscales',
    cfdi_use: 'S01',
    fiscal_tracked: false,
    cutoff_day: 16,
    subtotal: 950.00,       // MXN — ingreso mensual recurrente
    // Servicio recurrente
    service: {
      service_name: 'Mensualidad Barber',
      service_type: 'recurrente' as const,
      total_amount: 950.00,
      current_balance: 950.00,
    },
    // Cobranza del mes (pagada el día de corte de Mayo 2026)
    billing: {
      concept: 'Mensualidad Barber — Mayo 2026',
      amount: 950.00,
      status: 'pagado' as const,
      payment_form: 'Transferencia SPEI',
      bank_destination: 'BBVA México',
      due_date: '2026-05-16',
      paid_at: '2026-05-16T10:00:00-06:00',
      payment_date: '2026-05-16T10:00:00-06:00',
      amount_paid: 950.00,
    },
  },
  {
    email: 'contacto@kofiii.mx',
    password: 'Kofiii2026!',
    business_name: 'Kofiii',
    legal_name: 'KOFIII CAFE',
    rfc: 'XAXX010101000',  // No fiscal — RFC genérico
    postal_code: '00000',
    tax_regime: '616 - Sin obligaciones fiscales',
    cfdi_use: 'S01',
    fiscal_tracked: false,
    cutoff_day: 20,
    subtotal: 3000.00,      // MXN
    service: {
      service_name: 'Mensualidad Kofiii',
      service_type: 'recurrente' as const,
      total_amount: 3000.00,
      current_balance: 3000.00,
    },
    billing: {
      concept: 'Mensualidad Kofiii — Mayo 2026',
      amount: 3000.00,
      status: 'pagado' as const,
      payment_form: 'Transferencia SPEI',
      bank_destination: 'BBVA México',
      due_date: '2026-05-20',
      paid_at: '2026-05-20T11:30:00-06:00',
      payment_date: '2026-05-20T11:30:00-06:00',
      amount_paid: 3000.00,
    },
  },
  {
    email: 'david@delvalle.mx',
    password: 'DelValle2026!',
    business_name: 'David del Valle - Redes Sociales',
    legal_name: 'DAVID DEL VALLE',
    // RFC fiscal real (13 chars = Persona Física)
    rfc: 'VALD900101AB1',
    postal_code: '64000',
    tax_regime: '612 - Personas Físicas con Actividades Empresariales y Profesionales',
    cfdi_use: 'G03',
    fiscal_tracked: true,
    cutoff_day: 23,
    subtotal: 14000.00,     // MXN — solo la iguala recurrente (NO incluye el proyecto Kardex)
    // Dos servicios: iguala recurrente + proyecto de instalación
    services: [
      {
        service_name: 'Iguala Redes Sociales',
        service_type: 'recurrente' as const,
        total_amount: 14000.00,
        current_balance: 14000.00,
      },
      {
        service_name: 'Desarrollo de Kardex',
        service_type: 'instalacion_proyecto' as const,
        total_amount: 45000.00,
        current_balance: 45000.00, // Saldo total pendiente — sin abonos al momento del seed
      },
    ],
    // Dos cargos: mensualidad pagada + proyecto pendiente
    billings: [
      {
        concept: 'Iguala Redes Sociales — Mayo 2026',
        service_index: 0, // Corresponde a 'Iguala Redes Sociales'
        amount: 14000.00,
        status: 'pagado' as const,
        payment_form: 'Transferencia SPEI',
        bank_destination: 'BBVA México',
        due_date: '2026-05-23',
        paid_at: '2026-05-23T09:15:00-06:00',
        payment_date: '2026-05-23T09:15:00-06:00',
        amount_paid: 14000.00,
      },
      {
        concept: 'Desarrollo de Kardex — Proyecto de Instalación',
        service_index: 1, // Corresponde a 'Desarrollo de Kardex'
        amount: 45000.00,
        status: 'pendiente' as const,
        payment_form: null,
        bank_destination: null,
        due_date: '2026-06-15', // Fecha límite de pago acordada
        paid_at: null,
        payment_date: null,
        amount_paid: 0.00,
      },
    ],
    // Documento inicial en el expediente de David
    document: {
      file_name: 'Contrato Desarrollo de Kardex - Firmado.pdf',
      file_url: 'https://mock-storage.vercel-storage.com/documents/david-delvalle/contrato-kardex-firmado.pdf',
      document_type: 'Contrato' as const,
    },
  },
];

// Emails a limpiar antes del seed (idempotencia)
const SEED_EMAILS = CLIENTS.map(c => c.email);

// ─────────────────────────────────────────────────────────────────────────────
// LÓGICA PRINCIPAL DEL SEED
// ─────────────────────────────────────────────────────────────────────────────

async function runSeed() {
  console.log('\n🌱 Kevin Consulting — Seed de Producción');
  console.log('━'.repeat(55));
  console.log('📡 Conectando a Neon DB...\n');

  const client: PoolClient = await pool.connect();

  try {
    // ── 1. Activar contexto de administrador para saltar RLS ─────────────────
    // Necesario porque FORCE ROW LEVEL SECURITY está activo en todas las tablas.
    // Inyectamos el rol de admin en la sesión antes de BEGIN para garantizar
    // que el contexto persiste dentro de la transacción completa.
    await client.query(`SELECT set_config('app.current_user_role', 'admin', false)`);
    await client.query(`SELECT set_config('app.current_user_id', '00000000-0000-0000-0000-000000000000', false)`);

    // ── 2. INICIO DE TRANSACCIÓN ATÓMICA ────────────────────────────────────
    // Todo el bloque de inserciones está dentro de un BEGIN ... COMMIT.
    // Si cualquier INSERT falla → ROLLBACK automático → sin datos huérfanos.
    await client.query('BEGIN');
    console.log('🔒 Transacción iniciada (BEGIN). RLS desactivado para rol admin.\n');

    // ── 3. LIMPIEZA IDEMPOTENTE ──────────────────────────────────────────────
    // Eliminar en cascada desde users (FK ON DELETE CASCADE propagará a clients,
    // contracts_services, billings y documents automáticamente).
    console.log('🗑️  Limpiando registros anteriores del seed...');
    const deleteResult = await client.query(
      `DELETE FROM users WHERE email = ANY($1::text[]) RETURNING email`,
      [SEED_EMAILS]
    );
    if (deleteResult.rows.length > 0) {
      console.log(`   ↳ Eliminados: ${deleteResult.rows.map(r => r.email).join(', ')}`);
    } else {
      console.log('   ↳ No había registros previos. Procediendo con inserción limpia.');
    }
    console.log();

    // ── 4. INSERCIÓN DE CLIENTES ─────────────────────────────────────────────
    for (const clientData of CLIENTS) {
      console.log(`👤 Procesando: ${clientData.business_name}`);

      // 4a. Hash de contraseña temporal
      const passwordHash = await bcrypt.hash(clientData.password, 10);

      // 4b. Crear usuario
      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, 'client')
         RETURNING id`,
        [clientData.email, passwordHash]
      );
      const userId: string = userRes.rows[0].id;
      console.log(`   ✅ Usuario creado: ${clientData.email} (id: ${userId.substring(0, 8)}...)`);

      // 4c. Crear perfil de cliente
      // NOTA: subtotal almacena únicamente el monto RECURRENTE mensual pactado.
      // Para David del Valle = $14,000 MXN (la iguala), NO incluye el proyecto Kardex.
      const clientRes = await client.query(
        `INSERT INTO clients (
          user_id, business_name, legal_name, rfc, postal_code,
          tax_regime, cfdi_use, fiscal_tracked, cutoff_day, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          userId,
          clientData.business_name,
          clientData.legal_name,
          clientData.rfc,
          clientData.postal_code,
          clientData.tax_regime,
          clientData.cfdi_use,
          clientData.fiscal_tracked,
          clientData.cutoff_day,
          clientData.subtotal,  // NUMERIC(12,2) — subtotal mensual recurrente
        ]
      );
      const clientDbId: string = clientRes.rows[0].id;
      console.log(`   ✅ Perfil de cliente creado (subtotal recurrente: $${clientData.subtotal.toFixed(2)} MXN)`);

      // 4d. Crear servicios contratados en contracts_services
      const isMultiService = 'services' in clientData;
      const servicesToInsert = isMultiService
        ? (clientData as any).services
        : [(clientData as any).service];

      const serviceIds: string[] = [];
      for (const svc of servicesToInsert) {
        const svcRes = await client.query(
          `INSERT INTO contracts_services (
            client_id, service_name, service_type, total_amount, current_balance, is_active
          ) VALUES ($1, $2, $3, $4, $5, true)
          RETURNING id`,
          [
            clientDbId,
            svc.service_name,
            svc.service_type,
            svc.total_amount,
            svc.current_balance,
          ]
        );
        serviceIds.push(svcRes.rows[0].id);
        console.log(
          `   ✅ Servicio registrado: "${svc.service_name}" [${svc.service_type}] — $${svc.total_amount.toFixed(2)} MXN`
        );
      }

      // 4e. Crear cargos de cobranza (billings) con fechas históricas precisas
      const billingsToInsert = isMultiService
        ? (clientData as any).billings
        : [(clientData as any).billing];

      for (const billing of billingsToInsert) {
        // Resolver el service_id correspondiente
        const serviceId: string | null = billing.service_index !== undefined
          ? serviceIds[billing.service_index]
          : serviceIds[0];

        await client.query(
          `INSERT INTO billings (
            client_id, service_id, concept, amount, status,
            payment_form, bank_destination, due_date,
            paid_at, payment_date, amount_paid
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            clientDbId,
            serviceId,
            billing.concept,
            billing.amount,          // NUMERIC(12,2) — monto base en MXN
            billing.status,
            billing.payment_form,
            billing.bank_destination,
            billing.due_date,
            billing.paid_at || null,
            billing.payment_date || null,
            billing.amount_paid ?? 0.00,
          ]
        );
        console.log(
          `   ✅ Billing "${billing.concept}" — $${billing.amount.toFixed(2)} MXN [${billing.status}]` +
          (billing.paid_at ? ` — Pagado: ${billing.paid_at.substring(0, 10)}` : '')
        );
      }

      // 4f. Insertar documento en expediente digital (si existe)
      if ('document' in clientData && (clientData as any).document) {
        const doc = (clientData as any).document;
        await client.query(
          `INSERT INTO documents (client_id, file_name, file_url, document_type)
           VALUES ($1, $2, $3, $4)`,
          [clientDbId, doc.file_name, doc.file_url, doc.document_type]
        );
        console.log(`   ✅ Documento registrado: "${doc.file_name}" [${doc.document_type}]`);
      }

      console.log();
    }

    // ── 5. COMMIT ATÓMICO ────────────────────────────────────────────────────
    await client.query('COMMIT');
    console.log('━'.repeat(55));
    console.log('✅ COMMIT exitoso — Todos los registros insertados correctamente.');
    console.log();

    // ── 6. VERIFICACIÓN POST-SEED ────────────────────────────────────────────
    console.log('🔍 Verificación de datos insertados:\n');

    const verifyClients = await client.query(
      `SELECT c.business_name, c.fiscal_tracked, c.cutoff_day,
              c.subtotal::float8 as subtotal_num
       FROM clients c
       JOIN users u ON c.user_id = u.id
       WHERE u.email = ANY($1::text[])
       ORDER BY c.cutoff_day`,
      [SEED_EMAILS]
    );

    let totalMRR = 0;
    console.log('  Cliente                              | Fiscal | Corte | Subtotal MXN');
    console.log('  ' + '─'.repeat(65));
    for (const row of verifyClients.rows) {
      // subtotal llega como string desde pg — parseamos a número flotante
      const subtotalNum = Number(row.subtotal_num);
      totalMRR += subtotalNum;
      const fiscalFlag = row.fiscal_tracked ? '  ✅ Sí' : '  ❌ No';
      console.log(
        `  ${row.business_name.padEnd(36)} | ${fiscalFlag.padEnd(6)} |  Día ${String(row.cutoff_day).padStart(2)} | $${subtotalNum.toFixed(2)}`
      );
    }
    console.log('  ' + '─'.repeat(65));
    console.log(`  ${'MRR TOTAL RECURRENTE'.padEnd(36)}              | $${totalMRR.toFixed(2)}`);
    console.log();

    // Verificar billings
    const verifyBillings = await client.query(
      `SELECT b.concept, b.amount::float8 as amount_num, b.status, b.due_date, b.paid_at
       FROM billings b
       JOIN clients c ON b.client_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE u.email = ANY($1::text[])
       ORDER BY b.due_date, b.created_at`,
      [SEED_EMAILS]
    );

    console.log('  Concepto de Cobranza                         | Monto MXN  | Estado    | Vencimiento');
    console.log('  ' + '─'.repeat(90));
    for (const row of verifyBillings.rows) {
      const amountNum = Number(row.amount_num);
      console.log(
        `  ${row.concept.substring(0, 44).padEnd(44)} | $${amountNum.toFixed(2).padStart(9)} | ${row.status.padEnd(9)} | ${row.due_date.toISOString().split('T')[0]}`
      );
    }
    console.log();

    if (Math.abs(totalMRR - 17950.00) < 0.01) {
      console.log(`🎯 MRR verificado: $${totalMRR.toFixed(2)} MXN ✅ (Objetivo: $17,950.00 MXN)`);
    } else {
      console.warn(`⚠️  MRR calculado ($${totalMRR.toFixed(2)}) difiere del objetivo ($17,950.00). Revisar subtotales.`);
    }

    console.log('\n🎉 Seed de producción completado exitosamente.');
    console.log('   Accede al portal con: admin@kevinconsulting.services / AdminTempPass123!');

  } catch (error: any) {
    // ── ROLLBACK ante cualquier error ────────────────────────────────────────
    try {
      await client.query('ROLLBACK');
      console.error('\n⛔ ERROR — Se realizó ROLLBACK. La base de datos NO fue modificada.');
    } catch (rbErr) {
      console.error('⛔ Error adicional durante ROLLBACK:', rbErr);
    }
    console.error('\nDetalle del error:\n', error.message || error);
    process.exit(1);
  } finally {
    client.release();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EJECUTAR Y CERRAR EL POOL
// ─────────────────────────────────────────────────────────────────────────────
runSeed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('❌ Error fatal en runSeed():', err);
    await pool.end();
    process.exit(1);
  });
