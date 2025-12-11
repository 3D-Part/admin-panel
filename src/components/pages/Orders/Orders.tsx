'use client'

import React from 'react'
import { OrdersTable } from './components/OrdersTable/OrdersTable'
// import { OrdersHeader } from './components/OrdersHeader'

const Orders = () => {
  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* <OrdersHeader /> */}
      <OrdersTable />
    </div>
  )
}

export default Orders
