import { GrantsPageView } from '@/features/grants/GrantsPageView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

export default async function GrantsPage() {
  const profile = await getProfile();
  const { canManageGrants, canDelete } = getPermissions(profile?.role);

  return <GrantsPageView canManageGrants={canManageGrants} canDelete={canDelete} />;
}
