import { PersonDetailView } from '@/features/persons/PersonDetailView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

interface PersonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonDetailPage({ params }: PersonDetailPageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const { canWrite, canDelete } = getPermissions(profile?.role);

  return (
    <PersonDetailView personId={id} canWrite={canWrite} canDelete={canDelete} />
  );
}
