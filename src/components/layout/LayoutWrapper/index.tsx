'use client'

import { URLPartsEnum } from '@/shared/enums'
import { usePathname } from 'next/navigation'
import React from 'react'
import Header from '../Header/Header'
import SideBar from '../SideBar/SideBar'

const LayoutWrapper = () => {
  const pathname = usePathname()
  const isLoginPage = pathname === URLPartsEnum.Login
  const isVerifyPage = pathname === URLPartsEnum.Verify

  if (isLoginPage || isVerifyPage) return

  return (
    <>
      <Header />
      <SideBar />
    </>
  )
}

export default LayoutWrapper
