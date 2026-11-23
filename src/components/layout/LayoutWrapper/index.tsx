'use client'

import { URLPartsEnum } from '@/shared/enums'
import { usePathname } from 'next/navigation'
import React, { Suspense } from 'react'
import Header from '../Header/Header'
import SideBar from '../SideBar/SideBar'
import AssistantAlert from '@/components/common/AssistantAlert/AssistantAlert'

const LayoutWrapper = () => {
  const pathname = usePathname()
  const isLoginPage = pathname === URLPartsEnum.Login
  const isVerifyPage = pathname === URLPartsEnum.Verify

  if (isLoginPage || isVerifyPage) return

  return (
    <>
      <Header />
      <Suspense>
        <SideBar />
      </Suspense>
      <AssistantAlert />
    </>
  )
}

export default LayoutWrapper
