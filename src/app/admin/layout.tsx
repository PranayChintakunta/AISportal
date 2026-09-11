import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getAdminViewer } from '@/lib/admin-access';
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session.userId) {
    redirect('/onboarding?mode=login');
  }

  const viewer = await getAdminViewer();

  if (!viewer?.canReview) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
