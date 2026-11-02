import Orders from '@/components/pages/Orders/Orders'
import React, { Suspense } from 'react'

const OrdersPage = () => {
  // ?view=offers is read on the client
  return (
    <Suspense>
      <Orders />
    </Suspense>
  )
}

export default OrdersPage
