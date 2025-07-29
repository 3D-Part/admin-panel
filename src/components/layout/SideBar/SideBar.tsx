'use client' // This is a client component 👈🏽

import { Sidebar } from 'flowbite-react'
import {
  HiFolderOpen,
  HiLightBulb,
  HiShoppingBag,
  HiLibrary,
  HiDocumentText,
} from 'react-icons/hi'
import { MdUnsubscribe } from 'react-icons/md'
import { IoMdPricetags } from 'react-icons/io'
import { FaUsers, FaShopify } from 'react-icons/fa'
import { FaUsersCog } from 'react-icons/fa'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import { useUISliceStore, useCurrentUserStore } from '@/store/store'
import {
  hasAnyPermission,
  PERMISSION_GROUPS,
} from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

const SideBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  const { changeIsMobileMenuOpen, isMobileMenuOpen } = useUISliceStore()

  const closeMobileMenu = () => {
    changeIsMobileMenuOpen(false)
  }

  // Filter menu items based on user permissions
  const getFilteredMenuItems = () => {
    const allMenuItems = [
      {
        name: 'Products',
        href: '/products',
        icon: HiShoppingBag,
        open: true,
        requiredPermissions: PERMISSION_GROUPS.PRODUCTS,
        children: [
          {
            name: 'All products',
            href: URLPartsEnum.Products,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: 'Add new product',
            href: URLPartsEnum.AddNewProduct,
            requiredPermissions: [PermissionEnum.PRODUCT_WRITE],
          },
        ],
      },
      {
        name: 'Categories',
        href: URLPartsEnum.Categories,
        icon: HiFolderOpen,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.CATEGORIES,
        children: [
          {
            name: 'All categories',
            href: URLPartsEnum.Categories,
            requiredPermissions: [PermissionEnum.CATEGORY_READ],
          },
          {
            name: 'Add new category',
            href: URLPartsEnum.AddNewCategory,
            requiredPermissions: [PermissionEnum.CATEGORY_WRITE],
          },
        ],
      },
      {
        name: 'Manufacturers',
        href: URLPartsEnum.Manufacturers,
        icon: HiLibrary,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.MANUFACTURERS,
        children: [
          {
            name: 'All manufacturers',
            href: URLPartsEnum.Manufacturers,
            requiredPermissions: [PermissionEnum.MANUFACTURER_READ],
          },
          {
            name: 'Add new manufacturer',
            href: URLPartsEnum.AddNewManufacturer,
            requiredPermissions: [PermissionEnum.MANUFACTURER_WRITE],
          },
        ],
      },
      {
        name: 'Attributes',
        href: URLPartsEnum.Attributes,
        icon: HiLightBulb,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.ATTRIBUTES,
        children: [
          {
            name: 'All attributes',
            href: URLPartsEnum.Attributes,
            requiredPermissions: [PermissionEnum.ATTRIBUTES_READ],
          },
          {
            name: 'Add new attribute',
            href: URLPartsEnum.AddNewAttribute,
            requiredPermissions: [PermissionEnum.ATTRIBUTES_WRITE],
          },
        ],
      },
      {
        name: 'Orders',
        href: URLPartsEnum.Orders,
        icon: HiDocumentText,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.ORDERS,
        children: [
          {
            name: 'All orders',
            href: URLPartsEnum.Orders,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: 'Order Emails',
            href: URLPartsEnum.OrderEmails,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
        ],
      },
      {
        name: 'Promo Codes',
        href: URLPartsEnum.PromoCodes,
        icon: IoMdPricetags,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.PROMO_CODES,
        children: [
          {
            name: 'All promo code',
            href: URLPartsEnum.PromoCodes,
            requiredPermissions: [PermissionEnum.PROMO_CODE_READ],
          },
          {
            name: 'Add new promo code',
            href: URLPartsEnum.AddNewPromoCode,
            requiredPermissions: [PermissionEnum.PROMO_CODE_WRITE],
          },
        ],
      },
      {
        name: 'Sales',
        href: URLPartsEnum.Sales,
        icon: FaShopify,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.SALES,
      },
      {
        name: 'Users',
        href: URLPartsEnum.Users,
        icon: FaUsers,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.USERS,
      },
      {
        name: 'Employees',
        href: URLPartsEnum.Employees,
        icon: FaUsersCog,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.EMPLOYEES,
      },
      {
        name: 'Subscribers',
        href: URLPartsEnum.Subscribers,
        icon: MdUnsubscribe,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.SUBSCRIBERS,
      },
    ]

    // Filter menu items based on user permissions
    return allMenuItems
      .filter((menuItem) => {
        // Check if user has permission for this menu item
        const hasMenuPermission = hasAnyPermission(
          currentUser?.permissions,
          menuItem.requiredPermissions,
          currentUser?.role
        )

        // If menu item has children, also check if user has permission for any child
        if (menuItem.children) {
          const hasChildPermission = menuItem.children.some((child) =>
            hasAnyPermission(
              currentUser?.permissions,
              child.requiredPermissions,
              currentUser?.role
            )
          )
          return hasMenuPermission || hasChildPermission
        }

        return hasMenuPermission
      })
      .map((menuItem) => {
        // Filter children based on permissions
        if (menuItem.children) {
          const filteredChildren = menuItem.children.filter((child) =>
            hasAnyPermission(
              currentUser?.permissions,
              child.requiredPermissions,
              currentUser?.role
            )
          )
          return {
            ...menuItem,
            children: filteredChildren,
          }
        }
        return menuItem
      })
  }

  const menuItems = getFilteredMenuItems()

  return (
    <>
      <Sidebar
        className={`${
          isMobileMenuOpen ? '' : '-translate-x-full'
        } !rounded-none fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform sidebar-custom-bg border-r-0.5 border-gray-200 md:translate-x-0`}
        aria-label="Default sidebar example"
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            {menuItems.map((menuItem) => {
              if (menuItem.children && menuItem.children.length > 0) {
                return (
                  <Sidebar.Collapse
                    key={menuItem.name}
                    icon={menuItem.icon}
                    open={pathname.includes(menuItem.href)}
                    label={menuItem.name}
                  >
                    {menuItem.children.map((item) => {
                      return (
                        <Sidebar.Item
                          className="cursor-pointer"
                          key={item.name}
                          onClick={() => {
                            closeMobileMenu()
                            router.push(item.href, {
                              // shallow: true,
                            })
                          }}
                          active={pathname === item.href}
                        >
                          {item.name}
                        </Sidebar.Item>
                      )
                    })}
                  </Sidebar.Collapse>
                )
              } else {
                return (
                  <Sidebar.Item
                    className="cursor-pointer"
                    key={menuItem.name}
                    active={pathname === menuItem.href}
                    onClick={() => {
                      closeMobileMenu()
                      if (menuItem.href) router.push(menuItem.href)
                    }}
                    icon={menuItem.icon}
                  >
                    {menuItem.name}
                  </Sidebar.Item>
                )
              }
            })}
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </>
  )
}

export default SideBar
