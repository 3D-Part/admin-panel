'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import getCookie from '../helpers/getCookies'
import { isExpired } from 'react-jwt'
import { URLPartsEnum } from '../enums'

export const useInitialAuthCheck = () => {
  const router = useRouter()
  const refreshToken = getCookie('refreshToken')

  const isRefreshTokenExpired = isExpired(refreshToken)

  useEffect(() => {
    if (isRefreshTokenExpired) {
      router.push(URLPartsEnum.Login)
    }
  }, [])
}
