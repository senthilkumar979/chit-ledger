import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { getProfile } from '@/lib/auth/get-profile';
import { roleLabels } from '@/constants/roles';

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div>
      <PageHeader title="Settings" description="Account and preferences" />
      <Card padding="lg" className="max-w-lg">
        <CardHeader title="Profile" />
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-primary">{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-primary">
              {profile ? roleLabels[profile.role] : '—'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
