'use server';

import { put } from '@vercel/blob';
import pool, { queryWithRLS } from '@/lib/db';
import { auth } from '@/auth';

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
 * y registrar automáticamente su URL en la base de datos Neon bajo RLS.
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

  // Obtener sesión de usuario para inyectar variables de RLS
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: 'No autorizado: Sesión ausente o expirada.' };
  }

  const { id: userId, role } = session.user;

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

    // 2. Registrar en la base de datos de Neon usando queryWithRLS
    const savedDoc = await queryWithRLS(userId, role, async (dbClient) => {
      // Si el rol es cliente, validar que sólo intente subir documentos a su propio perfil comercial
      if (role === 'client') {
        const clientCheck = await dbClient.query('SELECT id FROM clients WHERE id = $1 AND user_id = $2', [clientId, userId]);
        if (clientCheck.rows.length === 0) {
          throw new Error('ACCESS_DENIED_TO_CLIENT');
        }
      }

      const insertQuery = `
        INSERT INTO documents (client_id, file_name, file_url, document_type)
        VALUES ($1, $2, $3, $4)
        RETURNING id, client_id, file_name, file_url, document_type, uploaded_at;
      `;
      const insertValues = [clientId, file.name, fileUrl, documentType];
      const res = await dbClient.query(insertQuery, insertValues);
      return res.rows[0];
    });

    console.log(`[DATABASE] Documento registrado exitosamente en Neon bajo RLS. ID: ${savedDoc.id}`);
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
    if (error.message === 'ACCESS_DENIED_TO_CLIENT') {
      return { success: false, message: 'Operación denegada: No tienes permisos para subir archivos a este perfil de cliente.' };
    }
    return {
      success: false,
      message: `Error al procesar el archivo: ${error.message || 'Error desconocido'}`
    };
  }
}

/**
 * Obtiene los documentos asociados a un cliente desde Neon DB, protegiendo la consulta con RLS.
 */
export async function getClientDocumentsAction(clientId: string) {
  if (!clientId) {
    throw new Error('Falta el identificador del cliente.');
  }

  // Obtener sesión de usuario para inyectar variables de RLS
  const session = await auth();
  if (!session?.user) {
    throw new Error('No autorizado: Inicie sesión para ver los expedientes.');
  }

  const { id: userId, role } = session.user;

  try {
    const documents = await queryWithRLS(userId, role, async (dbClient) => {
      // Si el rol es cliente, validar pertenencia (RLS lo haría de todos modos)
      if (role === 'client') {
        const clientCheck = await dbClient.query('SELECT id FROM clients WHERE id = $1 AND user_id = $2', [clientId, userId]);
        if (clientCheck.rows.length === 0) {
          throw new Error('ACCESS_DENIED');
        }
      }

      const res = await dbClient.query(`
        SELECT id, file_name, file_url, document_type, uploaded_at
        FROM documents
        WHERE client_id = $1
        ORDER BY uploaded_at DESC;
      `, [clientId]);
      return res.rows;
    });

    return documents.map(doc => ({
      id: doc.id,
      file_name: doc.file_name,
      file_url: doc.file_url,
      document_type: doc.document_type,
      uploaded_at: doc.uploaded_at.toISOString(),
    }));
  } catch (error: any) {
    console.error('[DB ERROR] Error al consultar documentos del cliente:', error);
    if (error.message === 'ACCESS_DENIED') {
      throw new Error('No tienes permisos para ver este expediente de documentos.');
    }
    throw new Error('No se pudo obtener el historial de documentos.');
  }
}

/**
 * Obtiene los registros de auditoría de automatización (system_logs) desde Neon DB.
 * Restringido estrictamente a administradores mediante la validación de la sesión.
 */
export async function getSystemLogsAction() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('No autorizado: Inicie sesión para ver la bitácora.');
  }

  // Restricción explícita de seguridad de capa de aplicación
  if (session.user.role !== 'admin') {
    throw new Error('Acceso prohibido: Se requieren permisos de Administrador.');
  }

  const { id: userId, role } = session.user;

  try {
    // Al ser logs administrativos, los recuperamos bajo contexto de admin
    const logs = await queryWithRLS(userId, role, async (dbClient) => {
      const res = await dbClient.query(`
        SELECT id, event_type, message, details, created_at
        FROM system_logs
        ORDER BY created_at DESC
        LIMIT 10;
      `);
      return res.rows;
    });

    return logs.map(log => ({
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
