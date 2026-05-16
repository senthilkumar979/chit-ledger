import type { UserRole } from '@/constants/roles';
import { getPermissions } from '@/lib/permissions';

export function usePermissions(role: UserRole | undefined) {
  return getPermissions(role);
}
