'use client'

import { URLPartsEnum } from '@/shared/enums'
import { usePathname } from 'next/navigation'
import React from 'react'

const ChildrenWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const isLoginPage = pathname === URLPartsEnum.Login
  const isVerifyPage = pathname === URLPartsEnum.Verify
  const isFullWidthPage = isLoginPage || isVerifyPage

  return (
    <div
      className={`ml-0 flex items-center justify-center p-4 mt-16 md:p-12 ${
        !isFullWidthPage ? 'md:ml-64' : ''
      } `}
    >
      {children}
    </div>
  )
}

export default ChildrenWrapper
