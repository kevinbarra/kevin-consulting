import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;

  const pathname = nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/api/admin');
  const isClientRoute = pathname.startsWith('/api/client');

  // Verify and restrict access for admin paths
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }
  }

  // Verify and restrict access for client paths
  if (isClientRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    if (user?.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden: Clients only' }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  // Apply middleware strictly to target administrative and client-scoped API endpoints
  matcher: ['/api/admin/:path*', '/api/client/:path*'],
};
