import { LoansPageView } from '@/features/loans/LoansPageView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function LoansPage() {
  const profile = await getProfile();
  const { canManageLoans, canDelete } = getPermissions(profile?.role);

  return <LoansPageView canManageLoans={canManageLoans} canDelete={canDelete} />;
}
