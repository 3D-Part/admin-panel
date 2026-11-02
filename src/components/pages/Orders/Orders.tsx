'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useOrdersStore } from '@/store/store'
import { OrdersTable } from './components/OrdersTable/OrdersTable'
import { OrdersHeader } from './components/OrdersHeader'

const Orders = () => {
  const offers = useSearchParams().get('view') === 'offers'
  const { changeOffersOnly, changeCurrentPage, fetchOrders, itemsPerPage } =
    useOrdersStore()

  useEffect(() => {
    changeOffersOnly(offers)
    changeCurrentPage(1)
    fetchOrders({ offset: 0, limit: itemsPerPage })
  }, [offers, changeOffersOnly, changeCurrentPage, fetchOrders, itemsPerPage])

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {offers && (
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Offers
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Orders you offered to a customer. They hold no stock and do not count
            in analytics until you move them to Accepted.
          </p>
        </div>
      )}
      <OrdersHeader />
      <OrdersTable />
    </div>
  )
}

export default Orders
