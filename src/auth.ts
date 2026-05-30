import NextAuth, { DefaultSession, User as NextAuthUser } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Extend NextAuth typings
declare module 'next-auth' {
  interface User {
    role: 'admin' | 'client';
    clientId?: string;
  }
  interface Session {
    user: {
      id: string;
      role: 'admin' | 'client';
      clientId?: string;
    } & DefaultSession['user'];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Query the users table for the email
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userRes.rows[0];

        if (!user) {
          return null;
        }

        // Compare password hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
          return null;
        }

        // If user is a client, fetch the corresponding client ID for token cache
        let clientId: string | undefined = undefined;
        if (user.role === 'client') {
          const clientRes = await pool.query('SELECT id FROM clients WHERE user_id = $1', [user.id]);
          clientId = clientRes.rows[0]?.id;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          clientId
        };
      },
    }),
  ],
});
