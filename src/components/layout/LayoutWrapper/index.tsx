'use client'

import { URLPartsEnum } from '@/shared/enums'
import { usePathname } from 'next/navigation'
import React, { useEffect } from 'react'
import Header from '../Header/Header'
import SideBar from '../SideBar/SideBar'
import { useInitialAuthCheck } from '@/shared/hooks/useInitialAuthCheck'
import { useCurrentUserStore } from '@/store/store'
import AuthAPI from '@/services/auth'

const LayoutWrapper = () => {
  const pathname = usePathname()
  const isLoginPage = pathname === URLPartsEnum.Login
  const { currentUser, setCurrentUser, setLoading } = useCurrentUserStore()

  useInitialAuthCheck()

  useEffect(() => {
    // Initialize current user data if not already loaded and user is logged in
    if (!currentUser && !isLoginPage) {
      const initializeCurrentUser = async () => {
        setLoading(true)
        const userData = await AuthAPI.getCurrentUser()
        if (userData) {
          setCurrentUser(userData)
        }
        setLoading(false)
      }

      initializeCurrentUser()
    }
  }, [currentUser, isLoginPage, setCurrentUser, setLoading])

  if (isLoginPage) return

  return (
    <>
      <Header />
      <SideBar />
    </>
  )
}

export default LayoutWrapper
