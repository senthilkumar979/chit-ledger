import { PaymentsPageView } from '@/features/payments/PaymentsPageView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function PaymentsPage() {
  const profile = await getProfile();
  const { canWrite } = getPermissions(profile?.role);

  return <PaymentsPageView canWrite={canWrite} />;
}
