import { PersonsPageView } from '@/features/persons/PersonsPageView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function PersonsPage() {
  const profile = await getProfile();
  const { canWrite } = getPermissions(profile?.role);

  return <PersonsPageView canWrite={canWrite} />;
}
