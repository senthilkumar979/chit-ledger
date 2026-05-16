import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { AppHeader } from './AppHeader';
import type { Profile } from '@/types/database';

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export function AppShell({ children, profile }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-64">
        <AppHeader profile={profile} />
        <main className="px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
