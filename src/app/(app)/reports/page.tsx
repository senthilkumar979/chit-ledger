import { EnterpriseReportsView } from '@/features/reports/EnterpriseReportsView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function ReportsPage() {
  const profile = await getProfile();
  const { canExport } = getPermissions(profile?.role);

  return <EnterpriseReportsView canExport={canExport} />;
}
