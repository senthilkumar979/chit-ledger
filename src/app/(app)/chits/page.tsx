import { ChitsPageView } from '@/features/chits/ChitsPageView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function ChitsPage() {
  const profile = await getProfile();
  const { canWrite } = getPermissions(profile?.role);

  return <ChitsPageView canWrite={canWrite} />;
}
