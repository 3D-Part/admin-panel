'use client'

import React from 'react'
import { OrdersTable } from './components/OrdersTable/OrdersTable'

const Orders = () => {
  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <OrdersTable />
    </div>
  )
}

export default Orders
