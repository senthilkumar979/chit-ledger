export const UserRoles = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  STAFF: 'Staff',
  VIEWER: 'Viewer',
};
