'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useCurrentUserStore } from '@/store/store'
import AuthAPI from '@/services/auth'
import { URLPartsEnum } from '@/shared/enums'

interface AuthCheckProps {
  children: React.ReactNode
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const { currentUser, setCurrentUser, setLoading } = useCurrentUserStore()

  const isExcludedPage =
    pathname === URLPartsEnum.Login || pathname === URLPartsEnum.Verify

  useEffect(() => {
    const checkAuth = async () => {
      // If it's an excluded page, don't check auth
      if (isExcludedPage) {
        setIsChecking(false)
        return
      }

      // If we already have current user data, we're authenticated
      if (currentUser) {
        setIsChecking(false)
        return
      }

      try {
        setLoading(true)
        // Try to get current user data
        const userData = await AuthAPI.getCurrentUser()

        if (userData) {
          setCurrentUser(userData)
          setIsChecking(false)
        } else {
          // If we can't get user data, redirect to login
          window.location.href = URLPartsEnum.Login
        }
      } catch (error) {
        // If there's an error getting user data, redirect to login
        window.location.href = URLPartsEnum.Login
      } finally {
        setLoading(false)
      }
    }

    // Small delay to prevent flash
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [pathname, currentUser, setCurrentUser, setLoading, isExcludedPage])

  if (isChecking) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-40 h-40 mx-auto mb-6 animate-pulse">
            <Image
              src="/assets/img/logo.png"
              alt="3D Part Logo"
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default AuthCheck
