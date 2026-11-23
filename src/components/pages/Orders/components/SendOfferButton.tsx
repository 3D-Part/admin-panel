'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import { HiOutlineMail } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { WarningModal } from '@/components/common'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import { useOrdersStore } from '@/store/store'

/**
 * E-mails an offer to the customer, after a confirmation. As a plain button
 * in the order details, or as a small icon button in the row of the list.
 * Shows only for offers; the server refuses anything else.
 */
const SendOfferButton: React.FC<{
  order: Order
  variant?: 'button' | 'icon'
  onSent?: (order: Order) => void
}> = ({ order, variant = 'button', onSent }) => {
  const { currentPage, itemsPerPage, fetchOrders } = useOrdersStore()
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)

  if (order.status !== 'PROFORMA_SENT') return null

  const send = async () => {
    setSending(true)
    const { data: sent, error } = await OrdersAPI.orderSendOffer(order.id)
    setSending(false)
    setConfirming(false)
    if (!sent) {
      toast(error ? tx(error) : tx('Could not send the offer'), { type: 'error', autoClose: 7000 })
      return
    }
    toast(tx('Offer sent to {email}', { email: order.email }), {
      type: 'success',
      autoClose: 3000,
    })
    onSent?.({ ...order, billingSteps: sent.billingSteps })
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
            setConfirming(true)
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
          onClick={() => setConfirming(true)}
          disabled={!order.email}
          className="w-full sm:w-auto"
        >
          <HiOutlineMail className="mr-2 h-5 w-5" />
          {tx('Send offer by email')}
        </Button>
      )}
      <WarningModal
        isOpen={confirming}
        onSave={send}
        onClose={() => setConfirming(false)}
        isLoading={sending}
        buttonColor="purple"
        message={tx('Send the offer to {email}?', { email: order.email })}
      />
    </>
  )
}

export default SendOfferButton
