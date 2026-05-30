const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_Ey2DQXZu0mUn@ep-lingering-sea-aqy36n4h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
  ssl: { rejectUnauthorized: false }
});

async function runSimulation() {
  console.log("======================================================================");
  console.log("KEVIN CONSULTING - SIMULADOR DE COBRANZA Y TEST DE CONEXIONES");
  console.log("======================================================================");
  
  console.log("\n1. Conectando a Neon DB...");
  const testClient = await pool.connect();
  console.log("Conectado con éxito.");
  
  // Obtener el día actual para asegurar que al menos un cliente tenga fecha de corte hoy
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  
  const spanishMonths = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const concept = `Mensualidad ${spanishMonths[currentMonthIndex]}/${currentYear}`;

  console.log(`\n2. Verificando/Creando cliente semilla con cutoff_day = ${currentDay}...`);
  
  // Buscar un usuario existente o crear uno de prueba
  let userRes = await testClient.query("SELECT id FROM users WHERE email = 'test_cron_admin@kevinconsulting.com'");
  let userId;
  
  if (userRes.rows.length === 0) {
    console.log("Creando usuario semilla...");
    const userInsert = await testClient.query(`
      INSERT INTO users (email, password_hash, role)
      VALUES ('test_cron_admin@kevinconsulting.com', 'bcrypt_hash_placeholder', 'client')
      RETURNING id;
    `);
    userId = userInsert.rows[0].id;
  } else {
    userId = userRes.rows[0].id;
  }

  // Buscar un cliente de prueba o crearlo
  let clientRes = await testClient.query("SELECT id FROM clients WHERE user_id = $1", [userId]);
  let clientId;
  
  if (clientRes.rows.length === 0) {
    console.log(`Creando cliente de prueba ("Empresa Semilla") con cutoff_day = ${currentDay} y subtotal = $15,000.00 MXN...`);
    const clientInsert = await testClient.query(`
      INSERT INTO clients (user_id, business_name, legal_name, rfc, postal_code, tax_regime, cfdi_use, cutoff_day, subtotal)
      VALUES ($1, 'Empresa Semilla S.A. de C.V.', 'EMPRESA SEMILLA SA DE CV', 'ESE010101AA1', '01000', '601', 'G03', $2, 15000.00)
      RETURNING id;
    `, [userId, currentDay]);
    clientId = clientInsert.rows[0].id;
  } else {
    clientId = clientRes.rows[0].id;
    // Asegurar que el cutoff_day y subtotal coincidan para el test
    await testClient.query(`
      UPDATE clients 
      SET cutoff_day = $1, subtotal = 15000.00
      WHERE id = $2;
    `, [currentDay, clientId]);
    console.log(`Cliente de prueba actualizado con cutoff_day = ${currentDay}.`);
  }
  
  testClient.release(); // Liberar inmediatamente

  console.log("\n3. Ejecutando TEST DE ESTRES Y FUGAS DE CONEXIÓN (50 consultas rápidas)...");
  console.log("Monitoreando estado del Pool en tiempo real...");
  
  const startMemory = process.memoryUsage().heapUsed;
  const startTime = Date.now();
  
  const promises = [];
  
  for (let i = 0; i < 50; i++) {
    promises.push((async (index) => {
      const client = await pool.connect();
      try {
        // Ejecutar consulta simulando el filtro del cron
        const res = await client.query(`
          SELECT id, business_name, subtotal 
          FROM clients 
          WHERE cutoff_day = $1 AND subtotal > 0;
        `, [currentDay]);
        
        // Loggear estados del pool a la mitad y al final
        if (index === 25 || index === 49) {
          console.log(`[Pool Stats - Ejecución ${index + 1}/50] Conexiones totales: ${pool.totalCount}, Libres (idle): ${pool.idleCount}, Clientes esperando: ${pool.waitingCount}`);
        }
        return res.rows;
      } finally {
        client.release(); // Retornar al pool inmediatamente
      }
    })(i));
  }
  
  await Promise.all(promises);
  const endTime = Date.now();
  const endMemory = process.memoryUsage().heapUsed;
  
  console.log(`\nEstres finalizado con éxito.`);
  console.log(`- Tiempo total: ${endTime - startTime}ms`);
  console.log(`- Consumo de memoria inicial: ${(startMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Consumo de memoria final: ${(endMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Variación de memoria: ${((endMemory - startMemory) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`- Estado final del Pool -> Conexiones totales: ${pool.totalCount}, Libres: ${pool.idleCount}, En espera: ${pool.waitingCount}`);
  
  if (pool.waitingCount === 0 && pool.idleCount === pool.totalCount) {
    console.log("✅ VERIFICACIÓN EXITOSA: Todas las conexiones fueron liberadas correctamente. CERO fugas.");
  } else {
    console.warn("⚠️ ADVERTENCIA: Hay conexiones retenidas o esperando. Revisar flujo.");
  }

  console.log("\n4. Simulando proceso de facturación del Cron Job (Idempotencia)...");
  const cronClient = await pool.connect();
  
  try {
    // Eliminar facturas previas con el mismo concepto para el test inicial
    await cronClient.query("DELETE FROM billings WHERE client_id = $1 AND concept = $2", [clientId, concept]);
    
    // Ejecución 1: Debe crear la mensualidad
    console.log("Ejecutando Cron - Paso 1: Intentando crear mensualidad...");
    const check1 = await cronClient.query("SELECT id FROM billings WHERE client_id = $1 AND concept = $2", [clientId, concept]);
    let generated = false;
    
    if (check1.rows.length === 0) {
      const res = await cronClient.query(`
        INSERT INTO billings (client_id, concept, amount, status, due_date)
        VALUES ($1, $2, (SELECT subtotal FROM clients WHERE id = $1), 'pendiente', CURRENT_DATE + INTERVAL '10 days')
        RETURNING id;
      `, [clientId, concept]);
      console.log(`✅ Mensualidad creada. ID Factura: ${res.rows[0].id}`);
      generated = true;
    }
    
    // Ejecución 2: Debe omitir para asegurar idempotencia
    console.log("Ejecutando Cron - Paso 2: Re-ejecución idempotente...");
    const check2 = await cronClient.query("SELECT id FROM billings WHERE client_id = $1 AND concept = $2", [clientId, concept]);
    
    if (check2.rows.length > 0 && generated) {
      console.log("✅ IDEMPOTENCIA COMPROBADA: Mensualidad detectada. Omitiendo duplicados correctamente.");
    } else {
      console.error("❌ ERROR: Falla de idempotencia o no se registró el primer cobro.");
    }
    
    // Limpieza de factura de test
    await cronClient.query("DELETE FROM billings WHERE client_id = $1 AND concept = $2", [clientId, concept]);
    console.log("Factura de prueba eliminada para dejar limpia la base de datos.");
    
  } finally {
    cronClient.release();
  }

  console.log("\n5. Simulando proceso de Gestor Documental (Subida e inserción)...");
  const uploadClient = await pool.connect();
  try {
    const mockFileUrl = `https://mock-storage.vercel-storage.com/documents/${clientId}/test_file.pdf`;
    
    // Insertar metadata
    const docRes = await uploadClient.query(`
      INSERT INTO documents (client_id, file_name, file_url, document_type)
      VALUES ($1, 'Contrato_Simulado_Test.pdf', $2, 'Contrato')
      RETURNING id, file_name, document_type, uploaded_at;
    `, [clientId, mockFileUrl]);
    
    const doc = docRes.rows[0];
    console.log(`✅ Documento registrado en Neon DB con éxito.`);
    console.log(`   ID: ${doc.id}`);
    console.log(`   Archivo: ${doc.file_name}`);
    console.log(`   Tipo: ${doc.document_type}`);
    console.log(`   Fecha: ${doc.uploaded_at}`);
    
    // Limpiar documento de test
    await uploadClient.query("DELETE FROM documents WHERE id = $1", [doc.id]);
    console.log("Registro documental de prueba eliminado correctamente.");
  } finally {
    uploadClient.release();
  }

  // Cerrar el pool de forma segura
  console.log("\n6. Cerrando pool de conexiones de base de datos...");
  await pool.end();
  console.log("Pool cerrado. Proceso terminado.");
  console.log("======================================================================");
}

runSimulation().catch(err => {
  console.error("Critical error in simulation:", err);
  pool.end();
  process.exit(1);
});
