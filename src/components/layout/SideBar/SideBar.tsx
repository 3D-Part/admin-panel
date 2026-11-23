'use client'
import { tx } from '@/shared/i18n'

import { Sidebar } from 'flowbite-react'
import {
  HiFolderOpen,
  HiLightBulb,
  HiShoppingBag,
  HiLibrary,
  HiDocumentText,
  HiQuestionMarkCircle,
} from 'react-icons/hi'
import { MdUnsubscribe } from 'react-icons/md'
import { IoMdPricetags, IoMdSettings } from 'react-icons/io'
import { FaUsers, FaShopify } from 'react-icons/fa'
import { FaUsersCog, FaWarehouse, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'

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
import { NewsKey, useSidebarNews } from '@/shared/hooks/useSidebarNews'

const FIRST_TAB: Record<string, string> = {
  [URLPartsEnum.SettingsGeneral]: 'banner',
  [URLPartsEnum.Warehouse]: 'scanner',
  [URLPartsEnum.ActionsNeeded]: 'actions',
  [URLPartsEnum.Analytics]: 'overview',
}

const OPEN_GROUPS_KEY = 'sidebarOpenGroups'

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
        name: tx("Products"),
        href: '/products',
        icon: HiShoppingBag,
        open: true,
        requiredPermissions: PERMISSION_GROUPS.PRODUCTS,
        children: [
          {
            name: tx("All products"),
            href: URLPartsEnum.Products,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: tx("Out of stock"),
            href: URLPartsEnum.OutOfStockProducts,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: tx("Product groups"),
            href: `${URLPartsEnum.ProductGroups}?group=super-offer`,
            requiredPermissions: [PermissionEnum.PRODUCT_READ],
          },
          {
            name: tx("Add new product"),
            href: URLPartsEnum.AddNewProduct,
            requiredPermissions: [PermissionEnum.PRODUCT_WRITE],
          },
        ],
      },
      {
        name: tx("Categories"),
        href: URLPartsEnum.Categories,
        icon: HiFolderOpen,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.CATEGORIES,
        children: [
          {
            name: tx("All categories"),
            href: URLPartsEnum.Categories,
            requiredPermissions: [PermissionEnum.CATEGORY_READ],
          },
          {
            name: tx("Add new category"),
            href: URLPartsEnum.AddNewCategory,
            requiredPermissions: [PermissionEnum.CATEGORY_WRITE],
          },
        ],
      },
      {
        name: tx("Manufacturers"),
        href: URLPartsEnum.Manufacturers,
        icon: HiLibrary,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.MANUFACTURERS,
        children: [
          {
            name: tx("All manufacturers"),
            href: URLPartsEnum.Manufacturers,
            requiredPermissions: [PermissionEnum.MANUFACTURER_READ],
          },
          {
            name: tx("Add new manufacturer"),
            href: URLPartsEnum.AddNewManufacturer,
            requiredPermissions: [PermissionEnum.MANUFACTURER_WRITE],
          },
        ],
      },
      {
        name: tx("Attributes"),
        href: URLPartsEnum.Attributes,
        icon: HiLightBulb,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.ATTRIBUTES,
        children: [
          {
            name: tx("All attributes"),
            href: URLPartsEnum.Attributes,
            requiredPermissions: [PermissionEnum.ATTRIBUTES_READ],
          },
          {
            name: tx("Add new attribute"),
            href: URLPartsEnum.AddNewAttribute,
            requiredPermissions: [PermissionEnum.ATTRIBUTES_WRITE],
          },
        ],
      },
      {
        name: tx("Orders"),
        href: URLPartsEnum.Orders,
        icon: HiDocumentText,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.ORDERS,
        children: [
          {
            name: tx("All orders"),
            news: 'orders' as NewsKey,
            href: URLPartsEnum.Orders,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: tx("Offers"),
            news: 'offers' as NewsKey,
            href: `${URLPartsEnum.Orders}?view=offers`,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
          {
            name: tx("Order Emails"),
            href: URLPartsEnum.OrderEmails,
            requiredPermissions: [PermissionEnum.ORDERS_READ],
          },
        ],
      },
      {
        name: tx("Analytics"),
        href: URLPartsEnum.Analytics,
        icon: FaChartLine,
        open: false,
        requiredPermissions: [PermissionEnum.ANALYTICS_READ],
      },
      {
        name: tx("Actions needed"),
        href: URLPartsEnum.ActionsNeeded,
        icon: FaExclamationTriangle,
        open: false,
        requiredPermissions: [PermissionEnum.ACTIONS_READ],
        children: [
          {
            name: tx("Actions needed"),
            news: 'actions' as NewsKey,
            href: `${URLPartsEnum.ActionsNeeded}?tab=actions`,
            requiredPermissions: [PermissionEnum.ACTIONS_READ],
          },
          {
            name: tx("Stock alerts"),
            news: 'stock' as NewsKey,
            href: `${URLPartsEnum.ActionsNeeded}?tab=stock`,
            requiredPermissions: [PermissionEnum.ACTIONS_READ],
          },
          {
            name: tx("Workers tasks"),
            news: 'tasks' as NewsKey,
            href: `${URLPartsEnum.ActionsNeeded}?tab=tasks`,
            requiredPermissions: [PermissionEnum.ACTIONS_READ],
          },
        ],
      },
      {
        name: tx("Warehouse"),
        href: URLPartsEnum.Warehouse,
        icon: FaWarehouse,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.WAREHOUSE,
        children: [
          {
            name: tx("Scanner"),
            href: `${URLPartsEnum.Warehouse}?tab=scanner`,
            requiredPermissions: [PermissionEnum.WAREHOUSE_READ],
          },
          {
            name: tx("Inventory"),
            href: `${URLPartsEnum.Warehouse}?tab=inventory`,
            requiredPermissions: [PermissionEnum.WAREHOUSE_READ],
          },
          {
            name: tx("Labels"),
            href: `${URLPartsEnum.Warehouse}?tab=labels`,
            requiredPermissions: [PermissionEnum.WAREHOUSE_READ],
          },
          {
            name: tx("History"),
            href: `${URLPartsEnum.Warehouse}?tab=history`,
            requiredPermissions: [PermissionEnum.WAREHOUSE_READ],
          },
        ],
      },
      {
        name: tx("Promo Codes"),
        href: URLPartsEnum.PromoCodes,
        icon: IoMdPricetags,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.PROMO_CODES,
        children: [
          {
            name: tx("All promo code"),
            href: URLPartsEnum.PromoCodes,
            requiredPermissions: [PermissionEnum.PROMO_CODE_READ],
          },
          {
            name: tx("Add new promo code"),
            href: URLPartsEnum.AddNewPromoCode,
            requiredPermissions: [PermissionEnum.PROMO_CODE_WRITE],
          },
        ],
      },
      {
        name: tx("Sales"),
        href: URLPartsEnum.Sales,
        icon: FaShopify,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.SALES,
      },
      {
        name: tx("Users"),
        news: 'users' as NewsKey,
        href: URLPartsEnum.Users,
        icon: FaUsers,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.USERS,
      },
      {
        name: tx("Employees"),
        href: URLPartsEnum.Employees,
        icon: FaUsersCog,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.EMPLOYEES,
      },
      {
        name: tx("Subscribers"),
        news: 'subscribers' as NewsKey,
        href: URLPartsEnum.Subscribers,
        icon: MdUnsubscribe,
        open: false,
        requiredPermissions: PERMISSION_GROUPS.SUBSCRIBERS,
      },
      {
        name: tx("Settings"),
        href: URLPartsEnum.Settings,
        icon: IoMdSettings,
        open: true,
        requiredPermissions: PERMISSION_GROUPS.SETTINGS,
        children: [
          ...[
            ['Top banner', 'banner'],
            ['Home slider', 'home-slider'],
            ['Page images', 'page-images'],
            ['Discount tiers', 'discount-tiers'],
            ['Invoice statuses', 'invoice-statuses'],
            ['Customer statuses', 'customer-flags'],
            ['Order flags', 'order-flags'],
            ['Product flags', 'product-flags'],
            ['Ribbons', 'ribbons'],
            ['Zoho Campaigns', 'zoho-campaigns'],
            ['Delivery', 'delivery'],
            ['Company details', 'company'],
            ['Social media', 'social-media'],
            ['Chat assistant', 'assistant'],
          ].map(([name, tab]) => ({
            name,
            href: `${URLPartsEnum.SettingsGeneral}?tab=${tab}`,
            requiredPermissions: [PermissionEnum.SETTINGS_WRITE],
          })),
          {
            name: tx("Menu"),
            href: URLPartsEnum.SettingsMenu,
            requiredPermissions: [PermissionEnum.SETTINGS_WRITE],
          },
        ],
      },
      {
        name: tx("Guide"),
        href: URLPartsEnum.Guide,
        icon: HiQuestionMarkCircle,
        open: false,
        // last, so it stays out of the way; for everyone, whatever else they may see
        requiredPermissions: [] as PermissionEnum[],
      },
    ]

    // Filter menu items based on user permissions
    return allMenuItems
      .filter((menuItem) => {
        // Check if user has permission for this menu item
        const hasMenuPermission =
          menuItem.requiredPermissions.length === 0 ||
          hasAnyPermission(
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

  // the section on screen counts as seen
  const view = searchParams.get('view')
  const currentNews: NewsKey | null =
    pathname === URLPartsEnum.Orders
      ? view === 'offers'
        ? 'offers'
        : 'orders'
      : pathname === URLPartsEnum.Users
        ? 'users'
        : pathname === URLPartsEnum.Subscribers
          ? 'subscribers'
          : null
  const news = useSidebarNews(currentNews, !!currentUser)
  const countOf = (key?: NewsKey) => (key ? news[key] ?? 0 : 0)
  // new things are red, things waiting for someone are amber
  const colorOf = (key?: NewsKey) =>
    key === 'actions' || key === 'stock' || key === 'tasks' ? 'warning' : 'failure'
  const show = (count: number) => (count > 99 ? '99+' : String(count))

  // The group of the current page opens by itself, the rest stay as last left
  const [openGroups, setOpenGroups] = useState<string[]>([])
  const currentGroup = menuItems.find((menuItem) =>
    menuItem.children?.some((child) => child.href.split(/[?#]/)[0] === pathname)
  )?.name

  const saveOpenGroups = (groups: string[]) => {
    setOpenGroups(groups)
    try {
      localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(groups))
    } catch {}
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPEN_GROUPS_KEY) ?? '[]')
      if (Array.isArray(saved)) setOpenGroups(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (currentGroup) {
      setOpenGroups((groups) =>
        groups.includes(currentGroup) ? groups : [...groups, currentGroup]
      )
    }
  }, [currentGroup, pathname])

  const toggleGroup = (name: string) =>
    saveOpenGroups(
      openGroups.includes(name)
        ? openGroups.filter((group) => group !== name)
        : [...openGroups, name]
    )

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
    return (
      !clickedSection && !searchParams.get('new') && !searchParams.get('view')
    )
  }

  return (
    <>
      <Sidebar
        className={`${
          isMobileMenuOpen ? '' : '-translate-x-full'
        } !rounded-none fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform sidebar-custom-bg border-r-0.5 border-gray-200 md:translate-x-0`}
        aria-label={tx("Default sidebar example")}
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            {menuItems.map((menuItem) => {
              if (menuItem.children && menuItem.children.length > 0) {
                return (
                  <Sidebar.Collapse
                    key={menuItem.name}
                    icon={menuItem.icon}
                    open={openGroups.includes(menuItem.name)}
                    className={
                      openGroups.includes(menuItem.name)
                        ? '[&>svg:last-child]:rotate-180'
                        : ''
                    }
                    onClick={() => toggleGroup(menuItem.name)}
                    title={menuItem.name}
                    label={
                      (
                        <span className="flex items-center gap-2">
                          {menuItem.name}
                          {(() => {
                            const total = menuItem.children.reduce(
                              (sum, child) => sum + countOf((child as { news?: NewsKey }).news),
                              0
                            )
                            return total > 0 && !openGroups.includes(menuItem.name) ? (
                              <span className="rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                                {show(total)}
                              </span>
                            ) : null
                          })()}
                        </span>
                      ) as unknown as string
                    }
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
                          label={countOf((item as { news?: NewsKey }).news) > 0 ? show(countOf((item as { news?: NewsKey }).news)) : undefined}
                          labelColor={colorOf((item as { news?: NewsKey }).news)}
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
                    label={countOf((menuItem as { news?: NewsKey }).news) > 0 ? show(countOf((menuItem as { news?: NewsKey }).news)) : undefined}
                    labelColor={colorOf((menuItem as { news?: NewsKey }).news)}
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
