import { ChitDetailView } from '@/features/chits/ChitDetailView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

interface ChitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChitDetailPage({ params }: ChitDetailPageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const { canWrite, canDelete } = getPermissions(profile?.role);

  return <ChitDetailView chitId={id} canWrite={canWrite} canDelete={canDelete} />;
}
