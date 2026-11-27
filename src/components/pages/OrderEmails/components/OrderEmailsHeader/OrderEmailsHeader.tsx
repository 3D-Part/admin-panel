'use client'

import React from 'react'
import OrderEmailsSearch from './OrderEmailsSearch'

export const OrderEmailsHeader = () => (
  <div className="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-2 md:gap-4 z-20">
    <div className="w-full md:w-auto md:flex-1 min-w-0">
      <OrderEmailsSearch />
    </div>
  </div>
)
