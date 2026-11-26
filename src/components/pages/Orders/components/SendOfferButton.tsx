'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import { HiOutlineMail } from 'react-icons/hi'
import OfferProformaModal from './OfferProformaModal'
import { Order } from '@/shared/types'
import { useOrdersStore } from '@/store/store'

/**
 * Opens the proforma of an offer to check and change before it is e-mailed
 * to the customer. As a plain button in the order details, or as a small icon button in the row of the list.
 * Shows for every open offer (the server checks the same); a cancelled or
 * returned one has none.
 */
const SendOfferButton: React.FC<{
  order: Order
  variant?: 'button' | 'icon'
  onSent?: (order: Order) => void
}> = ({ order, variant = 'button', onSent }) => {
  const { currentPage, itemsPerPage, fetchOrders } = useOrdersStore()
  const [editing, setEditing] = useState(false)

  // every offer of the Offers list (an offer, or a company's order, at any
  // step) but a cancelled or returned one; a ticked step such as "accepted"
  // changes the status, the offer stays an offer
  const offer = order.status === 'PROFORMA_SENT' || !!order.isOffer || !!order.companyName?.trim()
  if (!offer || ['DECLINED', 'RETURNED'].includes(order.status)) return null

  const sent = (updated: Order) => {
    onSent?.({ ...order, billingSteps: updated.billingSteps })
    fetchOrders({ offset: (currentPage - 1) * itemsPerPage, limit: itemsPerPage })
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          disabled={!order.email}
          onClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
          title={tx('Send offer by email')}
          aria-label={tx('Send offer by email')}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-purple-300"
        >
          <HiOutlineMail className="h-5 w-5" />
        </button>
      ) : (
        <Button
          color="light"
          onClick={() => setEditing(true)}
          disabled={!order.email}
          className="w-full sm:w-auto"
        >
          <HiOutlineMail className="mr-2 h-5 w-5" />
          {tx('Send offer by email')}
        </Button>
      )}
      {editing && (
        // clicks in the window must not reach the row of the list (it opens the order)
        <div onClick={(e) => e.stopPropagation()}>
          <OfferProformaModal order={order} isOpen={editing} onClose={() => setEditing(false)} onSent={sent} />
        </div>
      )}
    </>
  )
}

export default SendOfferButton
