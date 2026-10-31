'use client'

import { Sidebar } from 'flowbite-react'
import {
  HiFolderOpen,
  HiLightBulb,
  HiShoppingBag,
  HiLibrary,
  HiDocumentText,
} from 'react-icons/hi'
import { MdUnsubscribe } from 'react-icons/md'
import { IoMdPricetags, IoMdSettings } from 'react-icons/io'
import { FaUsers, FaShopify } from 'react-icons/fa'
import { FaUsersCog, FaWarehouse, FaChartLine, FaFileInvoice, FaExclamationTriangle } from 'react-icons/fa'

import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import { useUISliceStore, useCurrentUserStore } from '@/store/store'
import {
  hasAnyPermission,
  PERMISSION_GROUPS,
} from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'
import { useEffect, useState } from 'react'

const FIRST_TAB: Record<string, string> = {
  [URLPartsEnum.Warehouse]: 'scanner',
  [URLPartsEnum.ActionsNeeded]: 'actions',
}

const SideBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  // a #section does not change the route, so the last clicked one is remembered
  const [clickedSection, setClickedSection] = useState('')

  useEffect(() => {
    setClickedSection('')
  }, [pathname])
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
            name: 'Out of stock',
            href: URLPartsEnum.OutOfStockProducts,
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
        name: 'Proformas',
        href: URLPartsEnum.Proformas,
        icon: FaFileInvoice,
        open: false,
        requiredPermissions: [PermissionEnum.ORDERS_READ],
        children: [
          {
            name: 'All proformas',
            href: URLPartsEnum.Proformas,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: 'New proforma',
            href: `${URLPartsEnum.Proformas}?new=1`,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
        ],
      },
      {
        name: 'Analytics',
        href: URLPartsEnum.Analytics,
        icon: FaChartLine,
        open: false,
        requiredPermissions: [PermissionEnum.ORDERS_READ],
        children: [
          {
            name: 'Overview',
            href: URLPartsEnum.Analytics,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: 'Revenue by day',
            href: `${URLPartsEnum.Analytics}#revenue-by-day`,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: 'Filaments',
            href: `${URLPartsEnum.Analytics}#filaments`,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: 'Top products',
            href: `${URLPartsEnum.Analytics}#top-products`,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
        ],
      },
      {
        name: 'Actions needed',
        href: URLPartsEnum.ActionsNeeded,
        icon: FaExclamationTriangle,
        open: false,
        requiredPermissions: [PermissionEnum.PRODUCT_READ],
        children: [
          {
            name: 'Actions needed',
            href: `${URLPartsEnum.ActionsNeeded}?tab=actions`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: 'Stock alerts',
            href: `${URLPartsEnum.ActionsNeeded}?tab=stock`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
        ],
      },
      {
        name: 'Warehouse',
        href: URLPartsEnum.Warehouse,
        icon: FaWarehouse,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.PRODUCTS,
        children: [
          {
            name: 'Scanner',
            href: `${URLPartsEnum.Warehouse}?tab=scanner`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: 'Inventory',
            href: `${URLPartsEnum.Warehouse}?tab=inventory`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: 'Labels',
            href: `${URLPartsEnum.Warehouse}?tab=labels`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: 'History',
            href: `${URLPartsEnum.Warehouse}?tab=history`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
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
      {
        name: 'Settings',
        href: URLPartsEnum.Settings,
        icon: IoMdSettings,
        open: true,
        requiredPermissions: PERMISSION_GROUPS.ADMIN,
        children: [
          ...[
            ['General', ''],
            ['Banner', '#banner'],
            ['Discount tiers', '#discount-tiers'],
            ['Page images', '#page-images'],
            ['Tidio chat', '#tidio'],
            ['Delivery', '#delivery'],
            ['Company details', '#company'],
            ['Social media', '#social-media'],
          ].map(([name, section]) => ({
            name,
            href: `${URLPartsEnum.SettingsGeneral}${section}`,
            requiredPermissions: [PermissionEnum.ADMIN_ONLY],
          })),
          {
            name: 'Menu',
            href: URLPartsEnum.SettingsMenu,
            requiredPermissions: [PermissionEnum.ADMIN_ONLY],
          },
        ],
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

  const isActive = (href: string) => {
    const [path, section] = href.split('#')
    const [route, query] = path.split('?')
    if (route !== pathname) return false
    if (section !== undefined) return clickedSection === section
    if (query) {
      const [key, value] = query.split('=')
      const current = searchParams.get(key)
      // no ?tab yet means the page is showing its first tab
      return current === value || (!current && value === FIRST_TAB[route])
    }
    return !clickedSection && !searchParams.get('new')
  }

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
                    // all open, so everything is visible without digging
                    open
                    label={menuItem.name}
                  >
                    {menuItem.children.map((item) => {
                      return (
                        <Sidebar.Item
                          className="cursor-pointer"
                          key={item.name}
                          onClick={() => {
                            closeMobileMenu()
                            setClickedSection(item.href.split('#')[1] ?? '')
                            router.push(item.href, {
                              // shallow: true,
                            })
                          }}
                          active={isActive(item.href)}
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
