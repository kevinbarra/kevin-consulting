import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

const spanishMonths = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * GET /api/cron
 * Generación automática de mensualidades basada en el cutoff_day del cliente.
 * Idempotente y robusto ante cierres de mes.
 */
export async function GET(request: NextRequest) {
  // 1. Verificación de seguridad
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const urlSecret = searchParams.get('secret');
  
  const cronSecret = process.env.CRON_SECRET;
  
  // Si CRON_SECRET está configurado, exigir que coincida en la cabecera Bearer o en el query param (?secret=...)
  if (cronSecret) {
    const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
    const isUrlParamValid = urlSecret === cronSecret;
    
    if (!isHeaderValid && !isUrlParamValid) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Token de cron inválido.' },
        { status: 401 }
      );
    }
  }

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Determinar si hoy es el último día del mes actual
  const nextMonthDate = new Date(currentYear, currentMonthIndex + 1, 1);
  const lastDayOfMonthDate = new Date(nextMonthDate.getTime() - 86400000);
  const lastDay = lastDayOfMonthDate.getDate();
  const isLastDayOfMonth = currentDay === lastDay;

  // Generar el concepto estándar: 'Mensualidad [Mes/Año Actual]'
  const monthName = spanishMonths[currentMonthIndex];
  const concept = `Mensualidad ${monthName}/${currentYear}`;

  console.log(`[CRON RUN] Iniciando proceso automatizado. Día: ${currentDay}/${lastDay}, Concepto: "${concept}"`);

  const dbClient = await pool.connect();
  const logsSummary = [];
  let generatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  try {
    // 2. Consultar los clientes cuyo cutoff_day coincide con hoy (o >= hoy si es el último día del mes)
    // Se filtran los clientes que tienen cutoff_day asignado y subtotal > 0
    let clientsQuery = '';
    let queryParams = [];

    if (isLastDayOfMonth) {
      clientsQuery = `
        SELECT id, business_name, subtotal, cutoff_day, fiscal_tracked
        FROM clients
        WHERE cutoff_day >= $1 AND subtotal > 0;
      `;
      queryParams = [currentDay];
    } else {
      clientsQuery = `
        SELECT id, business_name, subtotal, cutoff_day, fiscal_tracked
        FROM clients
        WHERE cutoff_day = $1 AND subtotal > 0;
      `;
      queryParams = [currentDay];
    }

    const clientsRes = await dbClient.query(clientsQuery, queryParams);
    const targetClients = clientsRes.rows;

    console.log(`[CRON RUN] Clientes objetivos encontrados: ${targetClients.length}`);

    // Iniciar transacción de cobros
    await dbClient.query('BEGIN');

    for (const client of targetClients) {
      try {
        // 3. Comprobar IDEMPOTENCIA: Verificar si ya existe una mensualidad generada para este cliente en el periodo actual
        const checkQuery = `
          SELECT id FROM billings 
          WHERE client_id = $1 AND concept = $2 LIMIT 1;
        `;
        const checkRes = await dbClient.query(checkQuery, [client.id, concept]);

        if (checkRes.rows.length > 0) {
          skippedCount++;
          logsSummary.push({
            client: client.business_name,
            status: 'SKIPPED',
            reason: 'La mensualidad de este periodo ya fue generada previamente (idempotente).'
          });
          continue;
        }

        // 4. Calcular due_date: 10 días naturales a partir de la fecha de corte real del mes actual
        const clientCutDay = Math.min(client.cutoff_day, lastDay);
        const cutoffDate = new Date(currentYear, currentMonthIndex, clientCutDay);
        const dueDate = new Date(cutoffDate);
        dueDate.setDate(cutoffDate.getDate() + 10);

        // 5. Crear el registro en la tabla 'billings'
        // El monto heredado del subtotal se inserta como amount.
        // status se asigna a 'pendiente'.
        const insertQuery = `
          INSERT INTO billings (client_id, concept, amount, status, due_date)
          VALUES ($1, $2, $3, 'pendiente', $4)
          RETURNING id;
        `;
        const insertValues = [
          client.id,
          concept,
          client.subtotal,
          dueDate
        ];

        const insertRes = await dbClient.query(insertQuery, insertValues);

        generatedCount++;
        logsSummary.push({
          client: client.business_name,
          status: 'SUCCESS',
          billingId: insertRes.rows[0].id,
          amount: parseFloat(client.subtotal),
          dueDate: dueDate.toISOString().split('T')[0]
        });

      } catch (clientErr: any) {
        errorCount++;
        console.error(`[CRON ERROR] Error procesando cliente ${client.business_name}:`, clientErr);
        logsSummary.push({
          client: client.business_name,
          status: 'ERROR',
          error: clientErr.message || 'Error desconocido'
        });
      }
    }

    // Confirmar la transacción
    await dbClient.query('COMMIT');

    // 6. Generar log interno de notificación en la tabla 'system_logs'
    const notificationMessage = `Emisión mensual de cobranza: ${generatedCount} mensualidades generadas, ${skippedCount} omitidas por duplicidad, ${errorCount} fallidas.`;
    const detailsJson = {
      execution_date: today.toISOString(),
      concept,
      processed_clients_count: targetClients.length,
      generated_count: generatedCount,
      skipped_count: skippedCount,
      error_count: errorCount,
      summary: logsSummary
    };

    await dbClient.query(`
      INSERT INTO system_logs (event_type, message, details)
      VALUES ($1, $2, $3);
    `, ['CRON_BILLING_GENERATION', notificationMessage, JSON.stringify(detailsJson)]);

    console.log(`[CRON RUN] Operación finalizada exitosamente. ${notificationMessage}`);

    return NextResponse.json({
      success: true,
      message: notificationMessage,
      details: detailsJson
    });

  } catch (error: any) {
    // Si la transacción falló de manera crítica, revertir
    try {
      await dbClient.query('ROLLBACK');
    } catch (rbErr) {
      console.error('[CRON CRITICAL] Error al ejecutar ROLLBACK:', rbErr);
    }
    
    console.error('[CRON CRITICAL ERROR] Falló la automatización horaria/diaria:', error);

    // Intentar guardar un log de error crítico (utilizando una conexión limpia si es posible)
    try {
      await pool.query(`
        INSERT INTO system_logs (event_type, message, details)
        VALUES ($1, $2, $3);
      `, [
        'CRON_BILLING_FAILURE', 
        `Fallo crítico del Cron Job: ${error.message || 'Error desconocido'}`, 
        JSON.stringify({ error: error.stack || error.message })
      ]);
    } catch (logErr) {
      console.error('[CRON LOG ERROR] No se pudo guardar el log de fallo crítico en DB:', logErr);
    }

    return NextResponse.json(
      { success: false, error: `Error interno de automatización: ${error.message}` },
      { status: 500 }
    );
  } finally {
    // IMPORTANTE: Liberar la conexión al pool para evitar fugas de conexiones y saturación
    dbClient.release();
    console.log('[CRON RUN] Conexión de base de datos liberada correctamente.');
  }
}
