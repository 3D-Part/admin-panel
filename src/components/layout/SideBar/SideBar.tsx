"use client"; // This is a client component 👈🏽

import { Sidebar } from "flowbite-react";
import {
  HiFolderOpen,
  HiLightBulb,
  HiShoppingBag,
  HiLibrary,
} from "react-icons/hi";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { URLPart } from "@/shared/enums";
import { useEffect } from "react";

const SideBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const jwtCookieName = "jwtToken";
    if (!document.cookie.includes(jwtCookieName)) {
      router.push(URLPart.Login), { shallow: true };
    }
  }, [router]);

  const menuItems = [
    {
      name: "Products",
      href: "/products",
      icon: HiShoppingBag,
      open: true,
      children: [
        {
          name: "All products",
          href: URLPart.Products,
        },
        {
          name: "Add new product",
          href: URLPart.AddNewProduct,
        },
      ],
    },
    {
      name: "Categories",
      href: URLPart.Categories,
      icon: HiFolderOpen,
      open: false,
      children: [
        {
          name: "All categories",
          href: URLPart.Categories,
        },
        {
          name: "Add new category",
          href: URLPart.AddNewCategory,
        },
      ],
    },
    {
      name: "Manufacturers",
      href: URLPart.Manufacturers,
      icon: HiLibrary,
      open: false,
      children: [
        {
          name: "All manufacturers",
          href: URLPart.Manufacturers,
        },
        {
          name: "Add new manufacturer",
          href: URLPart.AddNewManufacturer,
        },
      ],
    },
    {
      name: "Attributes",
      href: URLPart.Attributes,
      icon: HiLightBulb,
      open: false,
      children: [
        {
          name: "All attributes",
          href: URLPart.Attributes,
        },
        {
          name: "Add new attribute",
          href: URLPart.AddNewAttribute,
        },
      ],
    },
  ];
  return (
    <>
      <Sidebar
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform -translate-x-full bg-gray:50 border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
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
                          onClick={() =>
                            router.push(item.href, { shallow: true })
                          }
                          active={pathname === item.href}
                        >
                          {item.name}
                        </Sidebar.Item>
                      );
                    })}
                  </Sidebar.Collapse>
                );
              } else {
                return (
                  <Sidebar.Item
                    className="cursor-pointer"
                    key={menuItem.name}
                    active={pathname === menuItem.href}
                    // href={menuItem.href}
                    onClick={() =>
                      router.push(menuItem.href, { shallow: true })
                    }
                    icon={menuItem.icon}
                  >
                    {menuItem.name}
                  </Sidebar.Item>
                );
              }
            })}
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </>
  );
};

export default SideBar;
