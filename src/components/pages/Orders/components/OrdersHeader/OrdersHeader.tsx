'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { ToggleSwitch } from 'flowbite-react'
import { useOrdersStore } from '@/store/store'
import OrdersSearch from './OrdersSearch'
import OrdersSort from './OrdersSort'
import { ExportButton } from '@/components/common'

export const OrdersHeader = () => {
  const {
    disputedOnly,
    changeDisputedOnly,
    showCompanies,
    changeShowCompanies,
    offersOnly,
    changeCurrentPage,
    fetchOrders,
    itemsPerPage,
  } = useOrdersStore()

  return (
    <div className="w-full flex flex-wrap lg:flex-nowrap justify-between items-center gap-2 md:gap-4 z-20">
      <div className="w-full lg:w-auto lg:flex-1 min-w-0">
        <OrdersSearch />
      </div>
      {/* on a phone the controls sit in one row under the search */}
      <div className="flex w-full lg:w-auto lg:shrink-0 items-center justify-between gap-2 md:gap-4">
      {/* All orders start without the companies' orders (they have Offers) */}
      {!offersOnly && (
        <ToggleSwitch
          checked={showCompanies}
          label={tx('Show companies')}
          onChange={(value) => {
            changeShowCompanies(value)
            changeCurrentPage(1)
            fetchOrders({ offset: 0, limit: itemsPerPage })
          }}
        />
      )}
      <ToggleSwitch
        checked={disputedOnly}
        label={tx("Disputed only")}
        onChange={(value) => {
          changeDisputedOnly(value)
          changeCurrentPage(1)
          fetchOrders({ offset: 0, limit: itemsPerPage })
        }}
      />
      <OrdersSort />
      <ExportButton kind="orders" />
      </div>
    </div>
  )
}
