'use server';

import { auth } from '@/auth';
import { queryWithRLS } from '@/lib/db';
import bcrypt from 'bcryptjs';

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

/**
 * Server Action for administrators to generate and update a temporary password for a client.
 * Securely hashes the temporary password using bcryptjs and persists it under RLS.
 */
export async function resetClientPasswordAction(
  targetUserId: string,
  tempPassword: string
): Promise<ResetPasswordResult> {
  try {
    // 1. Authenticate session
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: 'No autorizado: Sesión ausente.' };
    }

    // 2. Validate administrator role
    if (session.user.role !== 'admin') {
      return { success: false, message: 'Acceso denegado: Se requiere rol de Administrador.' };
    }

    if (!targetUserId || !tempPassword || tempPassword.trim().length < 6) {
      return { success: false, message: 'La contraseña temporal debe tener al menos 6 caracteres.' };
    }

    // 3. Hash the temporary password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

    // 4. Update the user account in Neon DB using RLS
    await queryWithRLS(session.user.id, 'admin', async (dbClient) => {
      // Defense in depth: Verify the target user exists and has a 'client' role
      const userCheck = await dbClient.query(
        'SELECT id, role FROM users WHERE id = $1',
        [targetUserId]
      );
      if (userCheck.rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }
      if (userCheck.rows[0].role !== 'client') {
        throw new Error('NOT_A_CLIENT');
      }

      // Perform update
      await dbClient.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, targetUserId]
      );
    });

    console.log(`[SUPPORT] Contraseña temporal generada exitosamente para usuario: ${targetUserId}`);
    return {
      success: true,
      message: 'La contraseña temporal ha sido restablecida y persistida de forma segura.'
    };
  } catch (error: any) {
    console.error('[SUPPORT ERROR] Error al restablecer contraseña:', error);
    if (error.message === 'USER_NOT_FOUND') {
      return { success: false, message: 'El usuario destino no existe.' };
    }
    if (error.message === 'NOT_A_CLIENT') {
      return { success: false, message: 'No está permitido modificar la contraseña de otro administrador.' };
    }
    return {
      success: false,
      message: `Error interno del servidor: ${error.message || 'Error desconocido'}`
    };
  }
}
