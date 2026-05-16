import type { UserRole } from '@/constants/roles';

export function getPermissions(role: UserRole | undefined) {
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  return {
    canRead: Boolean(role),
    canWrite: isAdmin || isStaff,
    canDelete: isAdmin,
    canExport: isAdmin,
    canManageUsers: isAdmin,
    canManageLoans: isAdmin,
    canViewLoanAnalytics: isAdmin,
    isViewer: role === 'VIEWER',
  };
}
