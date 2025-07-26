'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import getCookie from '../helpers/getCookies'
import { isExpired } from 'react-jwt'
import { URLPartsEnum } from '../enums'

export const useInitialAuthCheck = () => {
  const router = useRouter()
  const pathname = usePathname()
  const refreshToken = getCookie('refreshToken')

  const isRefreshTokenExpired = isExpired(refreshToken)
  const isExcludedPage =
    pathname === URLPartsEnum.Login || pathname === URLPartsEnum.Verify

  useEffect(() => {
    if (isRefreshTokenExpired && !isExcludedPage) {
      router.push(URLPartsEnum.Login)
    }
  }, [isRefreshTokenExpired, isExcludedPage, router])
}
