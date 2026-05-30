'use server';

import { put } from '@vercel/blob';
import pool from '@/lib/db';

export interface UploadResult {
  success: boolean;
  message: string;
  document?: {
    id: string;
    client_id: string;
    file_name: string;
    file_url: string;
    document_type: string;
    uploaded_at: string;
  };
}

/**
 * Server Action para subir un archivo adjunto (Contratos, Addendums, CSF)
 * y registrar automáticamente su URL en la base de datos Neon.
 */
export async function uploadDocumentAction(formData: FormData): Promise<UploadResult> {
  const clientId = formData.get('clientId') as string;
  const documentType = formData.get('documentType') as string;
  const file = formData.get('file') as File;

  if (!clientId) {
    return { success: false, message: 'Falta el identificador del cliente (clientId).' };
  }
  if (!documentType) {
    return { success: false, message: 'Falta el tipo de documento (documentType).' };
  }
  if (!file || file.size === 0) {
    return { success: false, message: 'No se ha seleccionado ningún archivo válido.' };
  }

  // Validar tipo de documento según ENUM en base de datos
  const validTypes = ['Contrato', 'Addendum', 'CSF'];
  if (!validTypes.includes(documentType)) {
    return { success: false, message: `Tipo de documento inválido: ${documentType}. Debe ser Contrato, Addendum o CSF.` };
  }

  let fileUrl = '';
  try {
    // 1. Intentar subir a Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `documents/${clientId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: file.type || 'application/pdf',
      });
      fileUrl = blob.url;
      console.log(`[STORAGE] Archivo subido con éxito a Vercel Blob: ${fileUrl}`);
    } else {
      // Degradación graciosa para local/tests si no hay token de Vercel Blob
      console.warn('[STORAGE] BLOB_READ_WRITE_TOKEN no configurado. Utilizando simulación de almacenamiento.');
      fileUrl = `https://mock-storage.vercel-storage.com/documents/${clientId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    }

    // 2. Registrar en la base de datos de Neon
    const insertQuery = `
      INSERT INTO documents (client_id, file_name, file_url, document_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, client_id, file_name, file_url, document_type, uploaded_at;
    `;
    const insertValues = [clientId, file.name, fileUrl, documentType];

    const dbResult = await pool.query(insertQuery, insertValues);
    const savedDoc = dbResult.rows[0];

    console.log(`[DATABASE] Documento registrado exitosamente en Neon. ID: ${savedDoc.id}`);
    return {
      success: true,
      message: 'El documento ha sido cargado y registrado con éxito.',
      document: {
        id: savedDoc.id,
        client_id: savedDoc.client_id,
        file_name: savedDoc.file_name,
        file_url: savedDoc.file_url,
        document_type: savedDoc.document_type,
        uploaded_at: savedDoc.uploaded_at.toISOString(),
      }
    };

  } catch (error: any) {
    console.error('[UPLOAD ERROR] Falló la operación de carga de archivo:', error);
    return {
      success: false,
      message: `Error al procesar el archivo: ${error.message || 'Error desconocido'}`
    };
  }
}

/**
 * Obtiene los documentos asociados a un cliente desde Neon DB.
 */
export async function getClientDocumentsAction(clientId: string) {
  if (!clientId) {
    throw new Error('Falta el identificador del cliente.');
  }

  try {
    const res = await pool.query(`
      SELECT id, file_name, file_url, document_type, uploaded_at
      FROM documents
      WHERE client_id = $1
      ORDER BY uploaded_at DESC;
    `, [clientId]);

    return res.rows.map(doc => ({
      id: doc.id,
      file_name: doc.file_name,
      file_url: doc.file_url,
      document_type: doc.document_type,
      uploaded_at: doc.uploaded_at.toISOString(),
    }));
  } catch (error) {
    console.error('[DB ERROR] Error al consultar documentos del cliente:', error);
    throw new Error('No se pudo obtener el historial de documentos.');
  }
}

/**
 * Obtiene los registros de auditoría de automatización (system_logs) desde Neon DB.
 */
export async function getSystemLogsAction() {
  try {
    const res = await pool.query(`
      SELECT id, event_type, message, details, created_at
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT 10;
    `);

    return res.rows.map(log => ({
      id: log.id,
      event_type: log.event_type,
      message: log.message,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
      created_at: log.created_at.toISOString(),
    }));
  } catch (error) {
    console.error('[DB ERROR] Error al consultar logs del sistema:', error);
    throw new Error('No se pudo obtener el historial de automatización.');
  }
}
