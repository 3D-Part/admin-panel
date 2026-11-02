'use client'

import React from 'react'
import { ToggleSwitch } from 'flowbite-react'
import { useOrdersStore } from '@/store/store'
import OrdersSearch from './OrdersSearch'
import OrdersSort from './OrdersSort'

export const OrdersHeader = () => {
  const { disputedOnly, changeDisputedOnly, changeCurrentPage, fetchOrders, itemsPerPage } =
    useOrdersStore()

  return (
    <div className="w-full flex justify-between items-center gap-2 md:gap-4 z-20">
      <div className="flex-1 min-w-0">
        <OrdersSearch />
      </div>
      <ToggleSwitch
        checked={disputedOnly}
        label="Disputed only"
        onChange={(value) => {
          changeDisputedOnly(value)
          changeCurrentPage(1)
          fetchOrders({ offset: 0, limit: itemsPerPage })
        }}
      />
      <OrdersSort />
    </div>
  )
}
