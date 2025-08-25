'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCurrentUserStore } from '@/store/store'
import {
  hasAnyPermission,
  PERMISSION_GROUPS,
} from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'
import { URLPartsEnum } from '@/shared/enums'

// Route to permission mapping using URLPartsEnum
const ROUTE_PERMISSIONS: Record<string, PermissionEnum[]> = {
  [URLPartsEnum.Products]: [PermissionEnum.PRODUCT_READ],
  [URLPartsEnum.AddNewProduct]: [PermissionEnum.PRODUCT_WRITE],
  [URLPartsEnum.EditProduct]: [PermissionEnum.PRODUCT_WRITE],
  [URLPartsEnum.Categories]: [PermissionEnum.CATEGORY_READ],
  [URLPartsEnum.AddNewCategory]: [PermissionEnum.CATEGORY_WRITE],
  [URLPartsEnum.EditCategory]: [PermissionEnum.CATEGORY_WRITE],
  [URLPartsEnum.Manufacturers]: [PermissionEnum.MANUFACTURER_READ],
  [URLPartsEnum.AddNewManufacturer]: [PermissionEnum.MANUFACTURER_WRITE],
  [URLPartsEnum.EditManufacturer]: [PermissionEnum.MANUFACTURER_WRITE],
  [URLPartsEnum.Attributes]: [PermissionEnum.ATTRIBUTES_READ],
  [URLPartsEnum.AddNewAttribute]: [PermissionEnum.ATTRIBUTES_WRITE],
  [URLPartsEnum.EditAttribute]: [PermissionEnum.ATTRIBUTES_WRITE],
  [URLPartsEnum.Orders]: [PermissionEnum.ORDERS_READ],
  [URLPartsEnum.OrderEmails]: [PermissionEnum.ORDERS_READ],
  [URLPartsEnum.PromoCodes]: [PermissionEnum.PROMO_CODE_READ],
  [URLPartsEnum.AddNewPromoCode]: [PermissionEnum.PROMO_CODE_WRITE],
  [URLPartsEnum.EditPromoCode]: [PermissionEnum.PROMO_CODE_WRITE],
  [URLPartsEnum.Sales]: [PermissionEnum.SALE_READ],
  [URLPartsEnum.AddNewSale]: [PermissionEnum.SALE_WRITE],
  [URLPartsEnum.EditSale]: [PermissionEnum.SALE_WRITE],
  [URLPartsEnum.Users]: [PermissionEnum.USER_READ],
  [URLPartsEnum.Employees]: [PermissionEnum.EMPLOYEE_READ],
  [URLPartsEnum.Subscribers]: [], // No specific permission required
  [URLPartsEnum.SettingsMenu]: [PermissionEnum.ADMIN_ONLY], // Admin only access
}

// Routes that don't require permission checking
const PUBLIC_ROUTES = ['/', URLPartsEnum.Login, URLPartsEnum.Verify]

export const usePermissionGuard = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  useEffect(() => {
    // Don't check permissions for public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      return
    }

    // Don't check if no user (AuthCheck will handle this)
    if (!currentUser) {
      return
    }

    // Get required permissions for current route
    const requiredPermissions = ROUTE_PERMISSIONS[pathname]

    // If no specific permissions required for this route, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return
    }

    // Check if user has required permissions
    const hasAccess = hasAnyPermission(
      currentUser.permissions,
      requiredPermissions,
      currentUser.role
    )

    // Redirect to home if user doesn't have access
    if (!hasAccess) {
      console.warn(
        `User ${currentUser.email} attempted to access ${pathname} without permission`
      )
      router.push('/')
    }
  }, [pathname, currentUser, router])
}
