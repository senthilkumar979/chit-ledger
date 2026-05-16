import type { QueryClient } from '@tanstack/react-query';

export async function invalidateLoanQueries(
  queryClient: QueryClient,
  loanId?: string,
): Promise<void> {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: ['loans'] }),
    queryClient.invalidateQueries({ queryKey: ['profit-loss-data'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] }),
    queryClient.invalidateQueries({ queryKey: ['reports-data'] }),
  ];

  if (loanId) {
    tasks.push(queryClient.invalidateQueries({ queryKey: ['loan', loanId] }));
  }

  await Promise.all(tasks);
}
