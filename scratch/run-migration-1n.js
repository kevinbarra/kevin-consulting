const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Ey2DQXZu0mUn@ep-lingering-sea-aqy36n4h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function runMigration() {
  const migrationPath = path.join(__dirname, '../db/migration_1n_services.sql');
  console.log(`[Migración] Leyendo migración SQL desde: ${migrationPath}`);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`[Error] No se encontró el archivo de migración en: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('[Migración] Conectándose a la instancia de Neon.tech...');
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('[Migración] Conexión establecida con éxito.');

    console.log('[Migración] Ejecutando script de migración...');
    // El script ya incluye BEGIN y COMMIT internamente, pero vamos a correrlo completo
    await client.query(sql);
    
    console.log('[Migración] ¡Script de migración 1:N ejecutado exitosamente en Neon.tech!');
  } catch (error) {
    console.error('[Error de Migración] Falló la ejecución de la migración:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('[Migración] Conexión cerrada.');
  }
}

runMigration();
