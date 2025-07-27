'use client' // This is a client component 👈🏽

import React from 'react'
import Image from 'next/image'
import { Avatar, Dropdown, Navbar } from 'flowbite-react'
import JWT from '@/shared/helpers/jwtToken'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import AuthAPI from '@/services/auth'
import { useUISliceStore, useCurrentUserStore } from '@/store/store'
import ThemeSwitcher from '@/components/common/ThemeSwitcher'

const SideBar = () => {
  const router = useRouter()
  const { currentUser, clearCurrentUser } = useCurrentUserStore()

  const { changeIsMobileMenuOpen, isMobileMenuOpen } = useUISliceStore()

  const toggleMobileMenu = () => {
    changeIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const signOut = async () => {
    await AuthAPI.logout()
    JWT.deleteJwtTokens()
    clearCurrentUser()
    router.push(URLPartsEnum.Login)
  }

  return (
    <>
      <Navbar
        className="fixed top-0 z-50 w-full header-custom-bg border-b border-gray-600 shadow-sm rounded-none"
        fluid
        rounded
      >
        <Navbar.Brand href="/products">
          <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
            <Image
              src="/assets/img/logo.png"
              alt="me"
              width="138"
              height="44"
              priority
            />
          </span>
        </Navbar.Brand>

        <div className="flex gap-4 md:order-2 items-center text-white">
          <ThemeSwitcher />
          <Dropdown
            inline
            label={
              <Avatar
                alt="User settings"
                img="https://www.atptour.com/-/media/alias/player-headshot/D643"
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                {currentUser?.fullName || 'User'}
              </span>
              <span className="block truncate text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.email || 'user@example.com'}
              </span>
            </Dropdown.Header>
            <Dropdown.Item
              onClick={signOut}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="text-red-600 dark:text-red-400 font-medium">
                Sign out
              </span>
            </Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle
            onClick={toggleMobileMenu}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          />
        </div>
      </Navbar>
    </>
  )
}

export default SideBar
