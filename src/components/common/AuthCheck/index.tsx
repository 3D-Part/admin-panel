'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import getCookie from '@/shared/helpers/getCookies'
import { isExpired } from 'react-jwt'
import { URLPartsEnum } from '@/shared/enums'

interface AuthCheckProps {
  children: React.ReactNode
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const refreshToken = getCookie('refreshToken')
      const isRefreshTokenExpired = isExpired(refreshToken)
      const isExcludedPage =
        pathname === URLPartsEnum.Login || pathname === URLPartsEnum.Verify

      if (isRefreshTokenExpired && !isExcludedPage) {
        router.push(URLPartsEnum.Login)
        return
      }

      setIsAuthenticated(true)
      setIsChecking(false)
    }

    // Small delay to prevent flash
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [pathname, router])

  if (isChecking) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-40 h-40 mx-auto mb-6 animate-pulse">
            <Image
              src="/assets/img/logo.png"
              alt="3D Part Logo"
              width={400}
              height={400}
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
