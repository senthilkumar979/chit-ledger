import { GrantDetailView } from '@/features/grants/GrantDetailView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

interface GrantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GrantDetailPage({ params }: GrantDetailPageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const { canManageGrants, canDelete } = getPermissions(profile?.role);

  return <GrantDetailView grantId={id} canManageGrants={canManageGrants} canDelete={canDelete} />;
}
