import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Ey2DQXZu0mUn@ep-lingering-sea-aqy36n4h.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Extender el objeto global de NodeJS para almacenar el pool en desarrollo
declare global {
  var globalDbPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    max: 10, // Límite razonable para Next.js Serverless en Vercel
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas tras 30 segundos
    connectionTimeoutMillis: 2000, // Retornar error si la conexión tarda más de 2 segundos
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // En desarrollo, reutilizar el pool existente para evitar fugas de conexiones por Hot Reloading
  if (!global.globalDbPool) {
    global.globalDbPool = new Pool({
      connectionString,
      max: 5, // Menor límite en local para depurar mejor
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  pool = global.globalDbPool;
}

export { pool };
export default pool;

/**
 * Helper para consultas rápidas de un solo paso.
 * Adquiere una conexión, ejecuta la consulta y la libera automáticamente.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  
  // Loggear consultas lentas en desarrollo para auditorías de rendimiento
  if (process.env.NODE_ENV !== 'production' && duration > 500) {
    console.warn(`[SLOW QUERY] ${duration}ms: ${text.slice(0, 100)}...`);
  }
  
  return res;
}

/**
 * Adquiere una conexión del pool de manera manual.
 * IMPORTANTE: Recuerda invocar `client.release()` en un bloque `finally` para retornar la conexión al pool.
 */
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

/**
 * Execute queries inside a database transaction, setting row-level security (RLS) config values.
 * This guarantees proper isolation when utilizing connection pools.
 * 
 * @param userId UUID of the user requesting the operation
 * @param role role of the user requesting the operation ('admin' | 'client')
 * @param callback database operations to run under transaction
 */
export async function queryWithRLS<T>(
  userId: string,
  role: 'admin' | 'client',
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Set RLS session variables with explicit cast to text
    await client.query(`SELECT set_config('app.current_user_id', $1::text, true)`, [userId]);
    await client.query(`SELECT set_config('app.current_user_role', $1::text, true)`, [role]);
    
    // Execute callback with database client
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
