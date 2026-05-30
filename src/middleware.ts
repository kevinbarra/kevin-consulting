import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const pathname = nextUrl.pathname;

  // 1. Protección de Endpoints API
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isClientApiRoute = pathname.startsWith('/api/client');

  if (isAdminApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }
  }

  if (isClientApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 });
    }
    if (user?.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden: Clients only' }, { status: 403 });
    }
  }

  // 2. Protección de Vistas del Portal (/portal)
  const isPortalRoute = pathname.startsWith('/portal');

  if (isPortalRoute) {
    if (!isLoggedIn) {
      // Redirigir a login si no ha iniciado sesión
      const loginUrl = new URL('/login', nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    const isPortalAdminPage = pathname.startsWith('/portal/admin');
    const isPortalClientPage = pathname.startsWith('/portal/client');

    if (isPortalAdminPage && user?.role !== 'admin') {
      // Si un cliente intenta entrar al panel de admin, redirigir a su vista de cliente
      const clientUrl = new URL('/portal/client', nextUrl.origin);
      return NextResponse.redirect(clientUrl);
    }

    if (isPortalClientPage && user?.role !== 'client') {
      // Si un administrador intenta entrar al panel de cliente directo, redirigir a su consola admin
      const adminUrl = new URL('/portal/admin', nextUrl.origin);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  // Aplicar el middleware a endpoints API y vistas del portal
  matcher: [
    '/api/admin/:path*',
    '/api/client/:path*',
    '/portal/:path*'
  ],
};
