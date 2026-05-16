import { LoanDetailView } from '@/features/loans/LoanDetailView';
import { getProfile } from '@/lib/auth/get-profile';
import { getPermissions } from '@/lib/permissions';

interface LoanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = await params;
  const profile = await getProfile();
  const { canManageLoans, canDelete } = getPermissions(profile?.role);

  return <LoanDetailView loanId={id} canManageLoans={canManageLoans} canDelete={canDelete} />;
}
