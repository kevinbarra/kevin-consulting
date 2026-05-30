import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PortalClientLayout from './PortalClientLayout';

export const metadata = {
  title: "Portal | Kevin Consulting",
  description: "Mesa de control de facturación, cobranza y expedientes de contratos seguros."
};

/**
 * Server-side Layout for the secure Portal.
 * Enforces session checks on the server to prevent FOUC (Flash of Unauthenticated Content)
 * and passes the session data down to the client layout wrapper.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // If no session exists, redirect straight to the custom login screen
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <PortalClientLayout session={session}>
      {children}
    </PortalClientLayout>
  );
}
