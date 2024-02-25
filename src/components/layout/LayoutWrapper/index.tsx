'use client'

import { URLPartsEnum } from '@/shared/enums'
import { usePathname } from 'next/navigation'
import React from 'react'
import Header from '../Header/Header'
import SideBar from '../SideBar/SideBar'
import { useInitialAuthCheck } from '@/shared/hooks/useInitialAuthCheck'

const LayoutWrapper = () => {
    const pathname = usePathname()
    const isLoginPage = pathname === URLPartsEnum.Login

    useInitialAuthCheck()

    if (isLoginPage) return

    return (
        <>
            <Header />
            <SideBar />
        </>
    )
}

export default LayoutWrapper
