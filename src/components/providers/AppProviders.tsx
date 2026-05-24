'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { SupabaseLoadingProvider } from '@/components/providers/SupabaseLoadingProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <SupabaseLoadingProvider>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </SupabaseLoadingProvider>
    </QueryClientProvider>
  );
}
