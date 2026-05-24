'use client';

import { useEffect, useState } from 'react';
import { subscribeSupabaseLoading } from '@/lib/supabase/loading';
import { SupabaseLoader } from '@/components/ui/SupabaseLoader';

export function SupabaseLoadingProvider({ children }: { children: React.ReactNode }) {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => subscribeSupabaseLoading(setActiveCount), []);

  return (
    <>
      {children}
      {activeCount > 0 ? <SupabaseLoader variant="overlay" label="Syncing data…" /> : null}
    </>
  );
}
