import { describe, expect, it } from '@jest/globals';
import { getPermissions } from '@/lib/permissions';

describe('getPermissions', () => {
  it('grants full access to admin', () => {
    const p = getPermissions('ADMIN');
    expect(p.canWrite).toBe(true);
    expect(p.canDelete).toBe(true);
    expect(p.canExport).toBe(true);
  });

  it('restricts viewer to read only', () => {
    const p = getPermissions('VIEWER');
    expect(p.canWrite).toBe(false);
    expect(p.canRead).toBe(true);
  });

  it('allows staff to write but not delete', () => {
    const p = getPermissions('STAFF');
    expect(p.canWrite).toBe(true);
    expect(p.canDelete).toBe(false);
  });
});
