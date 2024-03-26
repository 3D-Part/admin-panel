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

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import { useUISliceStore } from '@/store/store'

const SideBar = () => {
  const pathname = usePathname()
  const router = useRouter()

  const { changeIsMobileMenuOpen, isMobileMenuOpen } = useUISliceStore()

  const closeMobileMenu = () => {
    changeIsMobileMenuOpen(false)
  }

  const menuItems = [
    {
      name: 'Products',
      href: '/products',
      icon: HiShoppingBag,
      open: true,
      children: [
        {
          name: 'All products',
          href: URLPartsEnum.Products,
        },
        {
          name: 'Add new product',
          href: URLPartsEnum.AddNewProduct,
        },
      ],
    },
    {
      name: 'Categories',
      href: URLPartsEnum.Categories,
      icon: HiFolderOpen,
      open: false,
      children: [
        {
          name: 'All categories',
          href: URLPartsEnum.Categories,
        },
        {
          name: 'Add new category',
          href: URLPartsEnum.AddNewCategory,
        },
      ],
    },
    {
      name: 'Manufacturers',
      href: URLPartsEnum.Manufacturers,
      icon: HiLibrary,
      open: false,
      children: [
        {
          name: 'All manufacturers',
          href: URLPartsEnum.Manufacturers,
        },
        {
          name: 'Add new manufacturer',
          href: URLPartsEnum.AddNewManufacturer,
        },
      ],
    },
    {
      name: 'Attributes',
      href: URLPartsEnum.Attributes,
      icon: HiLightBulb,
      open: false,
      children: [
        {
          name: 'All attributes',
          href: URLPartsEnum.Attributes,
        },
        {
          name: 'Add new attribute',
          href: URLPartsEnum.AddNewAttribute,
        },
      ],
    },
    {
      name: 'Orders',
      href: URLPartsEnum.Orders,
      icon: HiDocumentText,
      open: false,
    },
    {
      name: 'Promo Codes',
      href: URLPartsEnum.PromoCodes,
      icon: IoMdPricetags,
      open: false,
      children: [
        {
          name: 'All promo code',
          href: URLPartsEnum.PromoCodes,
        },
        {
          name: 'Add new promo code',
          href: URLPartsEnum.AddNewPromoCode,
        },
      ],
    },
    {
      name: 'Sales',
      // href: URLPartsEnum.Sales,
      icon: FaShopify,
      open: false,
    },

    {
      name: 'Users',
      href: URLPartsEnum.Users,
      icon: FaUsers,
      open: false,
    },
    {
      name: 'Subscribers',
      href: URLPartsEnum.Subscribers,
      icon: MdUnsubscribe,
      open: false,
    },
  ]
  return (
    <>
      <Sidebar
        className={`${
          isMobileMenuOpen ? '' : '-translate-x-full'
        } fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform  bg-gray:50 border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700`}
        aria-label="Default sidebar example"
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            {menuItems.map((menuItem) => {
              if (menuItem.children) {
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
                          // href={item.href}
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
                    // href={menuItem.href}
                    onClick={() => {
                      closeMobileMenu()
                      if (menuItem.href) {
                        router.push(menuItem.href, {
                          // shallow: true,
                        })
                      }
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
