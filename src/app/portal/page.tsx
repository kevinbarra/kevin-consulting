import { auth } from '@/auth';
import { redirect } from 'next/navigation';

/**
 * Root portal route. Evaluates user session and redirects to appropriate dashboard path.
 */
export default async function PortalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect based on user role
  if (session.user.role === 'admin') {
    redirect('/portal/admin');
  } else {
    redirect('/portal/client');
  }
}
