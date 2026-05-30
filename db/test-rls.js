const { Client } = require('pg');

const OWNER_CONNECTION_STRING = "postgresql://neondb_owner:npg_Ey2DQXZu0mUn@ep-lingering-sea-aqy36n4h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";
const TEST_USER = "portal_test_user";
const TEST_PASSWORD = "TestPassword123#";

// El símbolo '#' en la contraseña debe codificarse para ser parte de la URL de conexión
const TEST_PASSWORD_ENCODED = encodeURIComponent(TEST_PASSWORD);
const TEST_CONNECTION_STRING = `postgresql://${TEST_USER}:${TEST_PASSWORD_ENCODED}@ep-lingering-sea-aqy36n4h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require`;

// Códigos de color ANSI para formateo de terminal
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

function printSuccess(message) {
  console.log(`${GREEN}✔ ${message}${RESET}`);
}

function printFail(message) {
  console.log(`${RED}✘ ${message}${RESET}`);
}

function printStep(message) {
  console.log(`\n${CYAN}--- ${message} ---${RESET}`);
}

async function runTests() {
  console.log(`${YELLOW}Iniciando Suite de Pruebas de Seguridad RLS con Usuario Restringido...${RESET}`);
  
  // Conectarse como Propietario para preparar el usuario de pruebas
  const ownerClient = new Client({ connectionString: OWNER_CONNECTION_STRING });
  let testClient;

  try {
    await ownerClient.connect();
    printSuccess('Conectado como neondb_owner.');

    printStep('Preparando Usuario Restringido para Pruebas');
    
    // Revocar privilegios y eliminar rol si ya existía de alguna prueba previa fallida
    try {
      await ownerClient.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${TEST_USER};`);
      await ownerClient.query(`REVOKE ALL PRIVILEGES ON SCHEMA public FROM ${TEST_USER};`);
    } catch (e) {
      // Ignorar errores si el rol no existía previamente
    }
    await ownerClient.query(`DROP ROLE IF EXISTS ${TEST_USER};`);
    
    // Crear rol restringido con login
    await ownerClient.query(`CREATE ROLE ${TEST_USER} WITH LOGIN PASSWORD '${TEST_PASSWORD}';`);
    printSuccess(`Usuario de pruebas '${TEST_USER}' creado.`);

    // Otorgar privilegios en tablas y esquemas al usuario restringido
    await ownerClient.query(`GRANT USAGE ON SCHEMA public TO ${TEST_USER};`);
    await ownerClient.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${TEST_USER};`);
    printSuccess('Privilegios de lectura y escritura otorgados al usuario de pruebas.');

    // Limpiar tablas para iniciar limpios
    await ownerClient.query('TRUNCATE TABLE users CASCADE;');
    printSuccess('Base de datos limpia (Truncate).');

    // Conectarse como el nuevo usuario restringido para el resto de las pruebas
    testClient = new Client({ connectionString: TEST_CONNECTION_STRING });
    await testClient.connect();
    printSuccess(`Conectado exitosamente como el usuario restringido '${TEST_USER}'.`);

    // ====================================================================
    // INSERTAR DATOS DE SEMILLA (Simulando sesión admin para permitir insert)
    // ====================================================================
    printStep('Insertando Datos de Semilla (Sesión Admin)');
    
    // Iniciamos una transacción y seteamos el rol local como 'admin' para poder poblar la BD
    await testClient.query('BEGIN;');
    await testClient.query("SET LOCAL app.current_user_role = 'admin';");

    // Crear Usuarios
    const adminUserRes = await testClient.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('admin@kevinconsulting.com', 'hashed_admin_pass', 'admin')
      RETURNING id;
    `);
    const adminId = adminUserRes.rows[0].id;
    printSuccess(`Usuario Admin creado en BD: ${adminId}`);

    const clientAUserRes = await testClient.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('clientA@kofiii.com', 'hashed_client_pass_a', 'client')
      RETURNING id;
    `);
    const clientAUserId = clientAUserRes.rows[0].id;
    printSuccess(`Usuario Cliente A creado en BD: ${clientAUserId}`);

    const clientBUserRes = await testClient.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('clientB@other.com', 'hashed_client_pass_b', 'client')
      RETURNING id;
    `);
    const clientBUserId = clientBUserRes.rows[0].id;
    printSuccess(`Usuario Cliente B creado en BD: ${clientBUserId}`);

    // Crear Perfiles de Clientes
    const clientAPerfileRes = await testClient.query(`
      INSERT INTO clients (user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, fiscal_tracked, cutoff_day)
      VALUES ($1, 'Kofiii', 'Kofiii S.A. de C.V.', 'KOF123456AAA', '06600', '601', 'G03', TRUE, 5)
      RETURNING id;
    `, [clientAUserId]);
    const clientAClientId = clientAPerfileRes.rows[0].id;
    printSuccess(`Perfil de Cliente A (Kofiii) creado: ${clientAClientId}`);

    const clientBPerfilRes = await testClient.query(`
      INSERT INTO clients (user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, fiscal_tracked, cutoff_day)
      VALUES ($1, 'OtherCorp', 'OtherCorp S.A. de C.V.', 'OTH123456BBB', '11560', '603', 'P01', TRUE, 10)
      RETURNING id;
    `, [clientBUserId]);
    const clientBClientId = clientBPerfilRes.rows[0].id;
    printSuccess(`Perfil de Cliente B (OtherCorp) creado: ${clientBClientId}`);

    // Crear Facturas (Billings)
    const bill1Res = await testClient.query(`
      INSERT INTO billings (client_id, concept, amount, status, payment_form, bank_destination, sat_uuid, due_date, paid_at)
      VALUES ($1, 'Instalación', 12000.50, 'pagado', 'Transferencia', 'BBVA Cuenta *1234', '9a8b7c6d-1234-5678-abcd-ef1234567890', '2026-05-01', '2026-05-02 12:00:00-06')
      RETURNING id, amount, sat_uuid;
    `, [clientAClientId]);
    const bill1Id = bill1Res.rows[0].id;
    printSuccess(`Factura 1 de Cliente A (Instalación) insertada.`);

    const bill2Res = await testClient.query(`
      INSERT INTO billings (client_id, concept, amount, status, payment_form, due_date)
      VALUES ($1, 'Mensualidad (Mayo/2026)', 4500.00, 'pendiente', 'Por definir', '2026-06-05')
      RETURNING id;
    `, [clientAClientId]);
    const bill2Id = bill2Res.rows[0].id;
    printSuccess(`Factura 2 de Cliente A (Mensualidad Mayo) insertada.`);

    const bill3Res = await testClient.query(`
      INSERT INTO billings (client_id, concept, amount, status, payment_form, due_date)
      VALUES ($1, 'Mensualidad (Mayo/2026)', 6000.00, 'pendiente', 'Por definir', '2026-06-10')
      RETURNING id;
    `, [clientBClientId]);
    const bill3Id = bill3Res.rows[0].id;
    printSuccess(`Factura 3 de Cliente B (Mensualidad Mayo) insertada.`);

    // Crear Documentos
    const doc1Res = await testClient.query(`
      INSERT INTO documents (client_id, file_name, file_url, document_type)
      VALUES ($1, 'csf_kofiii.pdf', 'https://storage.kevinconsulting.com/docs/csf_kofiii.pdf', 'CSF')
      RETURNING id;
    `, [clientAClientId]);
    const doc1Id = doc1Res.rows[0].id;
    printSuccess(`Documento 1 de Cliente A (CSF) insertado.`);

    const doc2Res = await testClient.query(`
      INSERT INTO documents (client_id, file_name, file_url, document_type)
      VALUES ($1, 'contrato_other.pdf', 'https://storage.kevinconsulting.com/docs/contrato_other.pdf', 'Contrato')
      RETURNING id;
    `, [clientBClientId]);
    const doc2Id = doc2Res.rows[0].id;
    printSuccess(`Documento 2 de Cliente B (Contrato) insertado.`);

    await testClient.query('COMMIT;');
    printSuccess('Datos semilla confirmados.');

    // ====================================================================
    // PRUEBAS DE SEGURIDAD RLS
    // ====================================================================

    // PRUEBA 1: SIMULACIÓN DE CONSULTAS COMO CLIENTE A
    printStep('PRUEBA 1: Simulación de consultas como CLIENTE A');
    
    await testClient.query('BEGIN;');
    await testClient.query(`SET LOCAL app.current_user_id = '${clientAUserId}';`);
    await testClient.query(`SET LOCAL app.current_user_role = 'client';`);

    // Consultar usuarios
    const usersA = await testClient.query('SELECT * FROM users;');
    if (usersA.rows.length === 1 && usersA.rows[0].id === clientAUserId) {
      printSuccess('RLS Users: Cliente A sólo ve su propio registro de usuario.');
    } else {
      printFail(`RLS Users fallido. Esperaba 1, obtuve ${usersA.rows.length}.`);
    }

    // Consultar clients
    const clientsA = await testClient.query('SELECT * FROM clients;');
    if (clientsA.rows.length === 1 && clientsA.rows[0].id === clientAClientId) {
      printSuccess('RLS Clients: Cliente A sólo ve su propio perfil de cliente (Kofiii).');
    } else {
      printFail(`RLS Clients fallido. Esperaba 1, obtuve ${clientsA.rows.length}.`);
    }

    // Consultar billings
    const billingsA = await testClient.query('SELECT * FROM billings;');
    const allBillingsAForClientA = billingsA.rows.every(b => b.client_id === clientAClientId);
    if (billingsA.rows.length === 2 && allBillingsAForClientA) {
      printSuccess('RLS Billings: Cliente A sólo ve sus propias facturas (2 facturas).');
    } else {
      printFail(`RLS Billings fallido. Esperaba 2, obtuve ${billingsA.rows.length}.`);
    }

    // Consultar documentos
    const docsA = await testClient.query('SELECT * FROM documents;');
    if (docsA.rows.length === 1 && docsA.rows[0].client_id === clientAClientId) {
      printSuccess('RLS Documents: Cliente A sólo ve sus propios documentos.');
    } else {
      printFail(`RLS Documents fallido. Esperaba 1, obtuve ${docsA.rows.length}.`);
    }

    await testClient.query('COMMIT;');


    // PRUEBA 2: INTENTO DE ACCESO CRUZADO (Cliente A -> Cliente B)
    printStep('PRUEBA 2: Intento de lectura/escritura cruzada (Cliente A -> Cliente B)');
    
    await testClient.query('BEGIN;');
    await testClient.query(`SET LOCAL app.current_user_id = '${clientAUserId}';`);
    await testClient.query(`SET LOCAL app.current_user_role = 'client';`);

    // Intentar leer factura del Cliente B por ID
    const billBRead = await testClient.query('SELECT * FROM billings WHERE id = $1;', [bill3Id]);
    if (billBRead.rows.length === 0) {
      printSuccess('RLS Bloqueo de Lectura: Cliente A no puede leer la factura de Cliente B.');
    } else {
      printFail('VULNERABILIDAD: Cliente A pudo leer información privada de Cliente B.');
    }

    // Intentar modificar monto de la factura del Cliente B
    const updateBRes = await testClient.query('UPDATE billings SET amount = 9999.00 WHERE id = $1;', [bill3Id]);
    if (updateBRes.rowCount === 0) {
      printSuccess('RLS Bloqueo de Modificación: Cliente A no puede actualizar registros de Cliente B.');
    } else {
      printFail(`VULNERABILIDAD: Cliente A modificó registros de Cliente B. Afectados: ${updateBRes.rowCount}`);
    }

    // Intentar borrar documento de Cliente B
    const deleteBRes = await testClient.query('DELETE FROM documents WHERE id = $1;', [doc2Id]);
    if (deleteBRes.rowCount === 0) {
      printSuccess('RLS Bloqueo de Eliminación: Cliente A no puede borrar documentos de Cliente B.');
    } else {
      printFail(`VULNERABILIDAD: Cliente A eliminó documentos de Cliente B. Afectados: ${deleteBRes.rowCount}`);
    }

    await testClient.query('COMMIT;');


    // PRUEBA 3: SIMULACIÓN DE ADMINISTRADOR (Bypass de RLS)
    printStep('PRUEBA 3: Simulación de consultas como ADMINISTRADOR (Bypass RLS)');
    
    await testClient.query('BEGIN;');
    await testClient.query(`SET LOCAL app.current_user_id = '${adminId}';`);
    await testClient.query(`SET LOCAL app.current_user_role = 'admin';`);

    // Consultar todos los usuarios
    const allUsers = await testClient.query('SELECT * FROM users;');
    if (allUsers.rows.length === 3) {
      printSuccess('RLS Bypass Users: El admin ve los 3 usuarios de la plataforma.');
    } else {
      printFail(`RLS Bypass Users fallido. Cantidad: ${allUsers.rows.length}`);
    }

    // Consultar todos los clientes
    const allClients = await testClient.query('SELECT * FROM clients;');
    if (allClients.rows.length === 2) {
      printSuccess('RLS Bypass Clients: El admin ve los 2 perfiles de clientes.');
    } else {
      printFail(`RLS Bypass Clients fallido. Cantidad: ${allClients.rows.length}`);
    }

    // Consultar todas las facturas
    const allBillings = await testClient.query('SELECT * FROM billings;');
    if (allBillings.rows.length === 3) {
      printSuccess('RLS Bypass Billings: El admin ve las 3 facturas de la base de datos.');
    } else {
      printFail(`RLS Bypass Billings fallido. Cantidad: ${allBillings.rows.length}`);
    }

    // Modificar factura de Cliente A como Admin
    const updateAdminRes = await testClient.query('UPDATE billings SET status = \'atrasado\' WHERE id = $1;', [bill2Id]);
    if (updateAdminRes.rowCount === 1) {
      printSuccess('RLS Bypass Update: El administrador actualizó con éxito la factura de Cliente A.');
    } else {
      printFail('RLS Bypass Update fallido.');
    }

    await testClient.query('COMMIT;');


    // PRUEBA 4: VALIDACIÓN DE PRECISIÓN DECIMAL Y FOLIOS FISCALES SAT
    printStep('PRUEBA 4: Validación de Precisión Decimal y Folios Fiscales SAT (Requerimientos de Negocio)');
    
    await testClient.query('BEGIN;');
    await testClient.query(`SET LOCAL app.current_user_id = '${adminId}';`);
    await testClient.query(`SET LOCAL app.current_user_role = 'admin';`);

    const checkBill1 = await testClient.query('SELECT amount, sat_uuid FROM billings WHERE id = $1;', [bill1Id]);
    const billData = checkBill1.rows[0];

    // Verificar tipo numérico exacto sin redondeos
    if (billData.amount === '12000.50') {
      printSuccess(`Precisión de Monto: Se leyó exactamente '12000.50' (NUMERIC/String) evitando errores de coma flotante.`);
    } else {
      printFail(`Error de Precisión: Se esperaba '12000.50', se leyó '${billData.amount}'`);
    }

    // Verificar formato SAT UUID
    const satUuidExpected = '9a8b7c6d-1234-5678-abcd-ef1234567890';
    if (billData.sat_uuid === satUuidExpected) {
      printSuccess(`Formato SAT UUID: Guardado y leído correctamente en formato estándar de 36 caracteres con guiones (${billData.sat_uuid}).`);
    } else {
      printFail(`Error en SAT UUID: Se esperaba '${satUuidExpected}', se leyó '${billData.sat_uuid}'`);
    }

    await testClient.query('COMMIT;');

  } catch (error) {
    console.error(`${RED}ERROR DURANTE LA SUITE DE PRUEBAS:${RESET}`);
    console.error(error);
  } finally {
    if (testClient) {
      try {
        await testClient.end();
      } catch (e) {}
    }
    
    printStep('Limpieza Final de la Base de Datos');
    try {
      // Re-truncar las tablas usando el dueño
      await ownerClient.query('TRUNCATE TABLE users CASCADE;');
      printSuccess('Datos de prueba removidos de las tablas.');

      // Revocar privilegios y eliminar rol de pruebas
      await ownerClient.query(`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM ${TEST_USER};`);
      await ownerClient.query(`REVOKE ALL PRIVILEGES ON SCHEMA public FROM ${TEST_USER};`);
      await ownerClient.query(`DROP ROLE IF EXISTS ${TEST_USER};`);
      printSuccess(`Usuario de pruebas '${TEST_USER}' y sus privilegios eliminados del servidor.`);
    } catch (cleanupError) {
      console.error('Error al limpiar el entorno de pruebas:', cleanupError);
    } finally {
      await ownerClient.end();
      console.log('\nConexión con la base de datos cerrada.');
    }
  }
}

runTests();
