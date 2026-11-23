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
    // the page scrolls when it does not fit the window (a short window or
    // zoomed in); "safe" keeps the top of a tall page reachable
    <div
      className={`ml-0 flex [align-items:safe_center] justify-center p-2 mt-16 md:p-6 overflow-x-hidden overflow-y-auto ${
        !isFullWidthPage ? 'md:ml-64' : ''
      } `}
    >
      {children}
    </div>
  )
}

export default ChildrenWrapper
