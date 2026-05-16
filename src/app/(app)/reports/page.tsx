import { ReportsView } from '@/features/reports/ReportsView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function ReportsPage() {
  const profile = await getProfile();
  const { canExport } = getPermissions(profile?.role);

  return <ReportsView canExport={canExport} />;
}
