import { permissions } from '../permission/permissions';
import { Role } from '../interfaces/user';

export const usePermissions = (role: Role) => {
  const rolePermissions = permissions[role];

  return {
    has: (permission: string) => {
      if (role === 'super_admin') return true;
      return Boolean(rolePermissions?.[permission]);
    },
  };
};