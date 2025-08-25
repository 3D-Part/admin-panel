import { PermissionEnum, UserPermissions } from '@/shared/types'

// Helper function to get permission values from UserPermissions array
export const getPermissionValues = (
  userPermissions: UserPermissions[] | undefined
): PermissionEnum[] => {
  if (!userPermissions || userPermissions.length === 0) return []
  return userPermissions.map((perm) => perm.permission)
}

// Helper function to check if user has a specific permission
export const hasPermission = (
  userPermissions: UserPermissions[] | undefined,
  requiredPermission: PermissionEnum,
  userRole?: string
): boolean => {
  // Admin users have access to everything
  if (userRole === 'admin') {
    return true
  }

  if (!userPermissions || userPermissions.length === 0) return false

  // Check if any permission in the array matches the required permission
  return userPermissions.some((perm) => perm.permission === requiredPermission)
}

// Helper function to check if user has any of the required permissions
export const hasAnyPermission = (
  userPermissions: UserPermissions[] | undefined,
  requiredPermissions: PermissionEnum[],
  userRole?: string
): boolean => {
  // Admin users have access to everything
  if (userRole === 'admin') {
    return true
  }

  return requiredPermissions.some((permission) =>
    hasPermission(userPermissions, permission, userRole)
  )
}

// Helper function to check if user has all of the required permissions
export const hasAllPermissions = (
  userPermissions: UserPermissions[] | undefined,
  requiredPermissions: PermissionEnum[],
  userRole?: string
): boolean => {
  // Admin users have access to everything
  if (userRole === 'admin') {
    return true
  }

  return requiredPermissions.every((permission) =>
    hasPermission(userPermissions, permission, userRole)
  )
}

// Permission groups for menu items
export const PERMISSION_GROUPS = {
  PRODUCTS: [PermissionEnum.PRODUCT_READ, PermissionEnum.PRODUCT_WRITE],
  CATEGORIES: [PermissionEnum.CATEGORY_READ, PermissionEnum.CATEGORY_WRITE],
  MANUFACTURERS: [
    PermissionEnum.MANUFACTURER_READ,
    PermissionEnum.MANUFACTURER_WRITE,
  ],
  ATTRIBUTES: [PermissionEnum.ATTRIBUTES_READ, PermissionEnum.ATTRIBUTES_WRITE],
  ORDERS: [PermissionEnum.ORDERS_READ, PermissionEnum.ORDERS_WRITE],
  PROMO_CODES: [
    PermissionEnum.PROMO_CODE_READ,
    PermissionEnum.PROMO_CODE_WRITE,
  ],
  SALES: [PermissionEnum.SALE_READ, PermissionEnum.SALE_WRITE],
  USERS: [PermissionEnum.USER_READ],
  EMPLOYEES: [PermissionEnum.EMPLOYEE_READ, PermissionEnum.EMPLOYEE_WRITE],
  SUBSCRIBERS: [], // No specific permission required for subscribers
  ADMIN: [PermissionEnum.ADMIN_ONLY], // Admin only permissions
}
