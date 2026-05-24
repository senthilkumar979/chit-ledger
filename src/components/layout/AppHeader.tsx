'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import type { Profile } from '@/types/database';
import { roleLabels } from '@/constants/roles';

interface AppHeaderProps {
  profile: Profile | null;
}

export function AppHeader({ profile }: AppHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabaseRequest(() => supabase.auth.signOut());
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 lg:px-8">
        <Link href="/dashboard" className="lg:hidden">
          <BrandLogo size="xs" showWordmark wordmarkClassName="[&_p:last-child]:hidden" />
        </Link>
        <div className="hidden flex-1 lg:block" />
        <div className="flex items-center gap-3">
          {profile ? (
            <div className="text-right">
              <p className="text-sm font-medium text-primary">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-muted">{roleLabels[profile.role]}</p>
            </div>
          ) : null}
          <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
