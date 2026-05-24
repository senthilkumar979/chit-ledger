import type { QueryClient } from '@tanstack/react-query';

export async function invalidateGrantQueries(
  queryClient: QueryClient,
  grantId?: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['grants'] });
  if (grantId) {
    await queryClient.invalidateQueries({ queryKey: ['grant', grantId] });
  }
}
