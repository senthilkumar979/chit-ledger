import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getProfile } from '@/lib/auth/get-profile';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect('/auth/login');

  return <AppShell profile={profile}>{children}</AppShell>;
}
