'use client' // This is a client component 👈🏽

import React from 'react'
import Image from 'next/image'
import { Avatar, Dropdown, Navbar } from 'flowbite-react'
import JWT from '@/shared/helpers/jwtToken'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import AuthAPI from '@/services/auth'
import { useUISliceStore, useCurrentUserStore } from '@/store/store'

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
        className="fixed top-0 z-50 w-full bg-gray-800 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        fluid
        rounded
      >
        <Navbar.Brand href="/products">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            <Image
              src="/assets/img/logo.png"
              alt="me"
              width="138"
              height="44"
              priority
            />
          </span>
        </Navbar.Brand>

        <div className="flex gap-8 md:order-2 text-white">
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
              <span className="block text-sm">
                {currentUser?.fullName || 'User'}
              </span>
              <span className="block truncate text-sm font-medium">
                {currentUser?.email || 'user@example.com'}
              </span>
            </Dropdown.Header>
            {/* <Dropdown.Divider /> */}
            <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
          </Dropdown>
          <Navbar.Toggle onClick={toggleMobileMenu} />
        </div>
      </Navbar>
    </>
  )
}

export default SideBar
