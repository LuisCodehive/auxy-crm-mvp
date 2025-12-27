export const permissions = {
  client: {
    canCreateRequest: true,
    canChat: true,
    canRate: true,
    canManageVehicles: false,
    canAssignDrivers: false,
  },

  provider: {
    canCreateRequest: false,
    canChat: true,
    canRate: false,
    canManageVehicles: true,
    canAssignDrivers: true,
  },

  admin: {
    canCreateRequest: false,
    canChat: false,
    canManageVehicles: false,
    canAssignDrivers: false,
    canViewAll: true,
  },

  super_admin: {
    canEverything: true,
  },
};
