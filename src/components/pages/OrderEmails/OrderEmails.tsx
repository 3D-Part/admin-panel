'use client'

import React from 'react'

import EmailsTable from './components/EmailsTable/EmailsTable'
import { OrderEmailsHeader } from './components/OrderEmailsHeader'

const OrderEmails = () => {
  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <OrderEmailsHeader />
      <EmailsTable />
    </div>
  )
}

export default OrderEmails
