'use client'

import { useEffect } from 'react'
import getCookie from '../helpers/getCookies'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '../enums'
import { isExpired } from 'react-jwt'

export const useInitialAuthCheck = () => {
    const router = useRouter()
    const accessToken = getCookie('accessToken')
    const refreshToken = getCookie('refreshToken')

    const isAccessTokenExpired = isExpired(accessToken)
    const isRefreshTokenExpired = isExpired(refreshToken)

    useEffect(() => {
        if (isAccessTokenExpired || isRefreshTokenExpired) {
            router.push(URLPartsEnum.Login)
        }
    }, [])
}
