import type { QueryClient } from '@tanstack/react-query';

interface InvalidateChitQueriesOptions {
  personId?: string;
  chitId?: string;
}

export async function invalidateChitQueries(
  queryClient: QueryClient,
  options?: InvalidateChitQueriesOptions,
): Promise<void> {
  const tasks: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: ['chits'] }),
    queryClient.invalidateQueries({ queryKey: ['chits-by-person'] }),
    queryClient.invalidateQueries({ queryKey: ['payments'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] }),
  ];

  if (options?.chitId) {
    tasks.push(queryClient.invalidateQueries({ queryKey: ['chit', options.chitId] }));
  }

  if (options?.personId) {
    tasks.push(queryClient.invalidateQueries({ queryKey: ['person', options.personId] }));
  }

  await Promise.all(tasks);
}
