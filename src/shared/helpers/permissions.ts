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
  USERS: [PermissionEnum.USER_READ, PermissionEnum.USER_WRITE],
  EMPLOYEES: [PermissionEnum.EMPLOYEE_READ, PermissionEnum.EMPLOYEE_WRITE],
  PROFORMAS: [PermissionEnum.PROFORMA_READ, PermissionEnum.PROFORMA_WRITE],
  ANALYTICS: [PermissionEnum.ANALYTICS_READ],
  WAREHOUSE: [PermissionEnum.WAREHOUSE_READ, PermissionEnum.WAREHOUSE_WRITE],
  ACTIONS: [PermissionEnum.ACTIONS_READ, PermissionEnum.ACTIONS_WRITE],
  SUBSCRIBERS: [PermissionEnum.SUBSCRIBER_READ, PermissionEnum.SUBSCRIBER_WRITE],
  SETTINGS: [PermissionEnum.SETTINGS_WRITE],
}

/**
 * The sections an employee can be given, as shown on the employee form.
 * Each one has a "view" permission and, where it exists, an "edit" one that
 * includes the view.
 */
export const EMPLOYEE_PERMISSION_SECTIONS: {
  title: string
  hint?: string
  view?: PermissionEnum
  edit?: PermissionEnum
}[] = [
  { title: 'Products', view: PermissionEnum.PRODUCT_READ, edit: PermissionEnum.PRODUCT_WRITE },
  { title: 'Categories', view: PermissionEnum.CATEGORY_READ, edit: PermissionEnum.CATEGORY_WRITE },
  { title: 'Manufacturers', view: PermissionEnum.MANUFACTURER_READ, edit: PermissionEnum.MANUFACTURER_WRITE },
  { title: 'Attributes', view: PermissionEnum.ATTRIBUTES_READ, edit: PermissionEnum.ATTRIBUTES_WRITE },
  { title: 'Orders', hint: 'Orders, offers and order emails', view: PermissionEnum.ORDERS_READ, edit: PermissionEnum.ORDERS_WRITE },
  { title: 'Proformas', view: PermissionEnum.PROFORMA_READ, edit: PermissionEnum.PROFORMA_WRITE },
  { title: 'Analytics', hint: 'Sales, profit and the chat assistant costs', view: PermissionEnum.ANALYTICS_READ },
  { title: 'Actions needed', hint: 'Actions needed, stock alerts and workers tasks', view: PermissionEnum.ACTIONS_READ, edit: PermissionEnum.ACTIONS_WRITE },
  { title: 'Warehouse', view: PermissionEnum.WAREHOUSE_READ, edit: PermissionEnum.WAREHOUSE_WRITE },
  { title: 'Promo Codes', view: PermissionEnum.PROMO_CODE_READ, edit: PermissionEnum.PROMO_CODE_WRITE },
  { title: 'Sales', view: PermissionEnum.SALE_READ, edit: PermissionEnum.SALE_WRITE },
  { title: 'Users', hint: 'Customers; editing means their discount and points', view: PermissionEnum.USER_READ, edit: PermissionEnum.USER_WRITE },
  { title: 'Subscribers', hint: 'Editing means sending the newsletter', view: PermissionEnum.SUBSCRIBER_READ, edit: PermissionEnum.SUBSCRIBER_WRITE },
  { title: 'Employees', hint: 'Editing means adding employees and their permissions', view: PermissionEnum.EMPLOYEE_READ, edit: PermissionEnum.EMPLOYEE_WRITE },
  { title: 'Settings', hint: 'Banners, slider, tiers, delivery, company, chat assistant and menu', edit: PermissionEnum.SETTINGS_WRITE },
]

