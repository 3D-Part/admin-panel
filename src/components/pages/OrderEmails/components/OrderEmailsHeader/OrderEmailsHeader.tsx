'use client'

import React from 'react'
import OrderEmailsSearch from './OrderEmailsSearch'

export const OrderEmailsHeader = () => {
  return (
    <div className="w-full flex justify-between items-center gap-2 md:gap-4 z-20">
      <div className="flex-1 min-w-0">
        <OrderEmailsSearch />
      </div>
    </div>
  )
}
