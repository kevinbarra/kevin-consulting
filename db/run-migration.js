const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION_STRING = "postgresql://neondb_owner:npg_Ey2DQXZu0mUn@ep-lingering-sea-aqy36n4h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function runMigration() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  console.log(`[Migración] Leyendo esquema SQL desde: ${schemaPath}`);
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`[Error] No se encontró el archivo schema.sql en: ${schemaPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('[Migración] Conectándose a la instancia de Neon.tech...');
  const client = new Client({
    connectionString: CONNECTION_STRING,
  });

  try {
    await client.connect();
    console.log('[Migración] Conexión establecida con éxito.');

    console.log('[Migración] Iniciando transacción para ejecutar DDL...');
    await client.query('BEGIN');
    
    // Ejecutar todo el DDL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log('[Migración] ¡Esquema DDL y RLS creados exitosamente en la base de datos!');
  } catch (error) {
    console.error('[Error de Migración] Falló la ejecución del esquema:');
    console.error(error);
    
    try {
      console.log('[Migración] Ejecutando ROLLBACK debido a error...');
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[Error de Rollback] Falló al revertir la transacción:', rollbackError);
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('[Migración] Conexión cerrada.');
  }
}

runMigration();
