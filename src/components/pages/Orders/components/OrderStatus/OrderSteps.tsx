'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Order } from '@/shared/types'
import {
  BillingOption,
  StepLists,
  billingDot,
  listFor,
  otherList,
} from '@/shared/helpers/billingOptions'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'
import {
  STATUS_DOT,
  followsSteps,
  formatStepDate,
  useBillingSteps,
  visibleSteps,
} from './billingStepsStore'

/**
 * The circles in the Status column: one per step of the order's list (orders
 * or offers) from Settings, in that order. A step ticked in the Invoice
 * dropdown fills its circle with its color. A status no step is tied to
 * (e.g. Cancelled) paints every circle in the color of that status.
 */
const OrderSteps: React.FC<{ order: Order; lists: StepLists }> = ({
  order,
  lists,
}) => {
  const { steps, status } = useBillingSteps(order)
  const options = listFor(lists, status, order.isOffer)
  const shown = visibleSteps(options, steps, otherList(lists, status, order.isOffer))

  if (!followsSteps(status, options, steps, options === lists.offers)) {
    const fill = STATUS_DOT[status] ?? 'bg-gray-500 border-gray-500'
    return (
      <div
        className="flex items-center gap-1 shrink-0"
        aria-label={getOrderStatusLabel(status)}
      >
        {shown.map((option) => (
          <span key={option.id} className={`w-3 h-3 rounded-full border ${fill}`} />
        ))}
      </div>
    )
  }

  const describe = (option: BillingOption) =>
    `${tx(option.label)}: ${
      steps[option.id] ? formatStepDate(steps[option.id]) : tx('not yet')
    }`

  return (
    <div
      className="flex items-center gap-1 shrink-0"
      aria-label={shown.map(describe).join(', ')}
    >
      {shown.map((option) => (
        <span
          key={option.id}
          title={describe(option)}
          className={`w-3 h-3 rounded-full border transition-colors ${
            steps[option.id]
              ? billingDot(option.color).fill
              : 'bg-transparent border-gray-300 dark:border-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

export default OrderSteps
