'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Badge } from 'flowbite-react'
import getOrderStatusStyle from '@/shared/helpers/getOrderStatusStyle'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'
import { Order } from '@/shared/types'
import { BILLING_COLORS, BillingOption } from '@/shared/helpers/billingOptions'
import { followsSteps, lastTicked, useBillingSteps } from './billingStepsStore'

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge
    className={`justify-center whitespace-nowrap ${getOrderStatusStyle(status)}`}
  >
    {getOrderStatusLabel(status)}
  </Badge>
)

/**
 * In the Orders list the badge shows the rightmost ticked step, in that
 * step's color; for the four main statuses that is the order status itself.
 * Any other status (e.g. Cancelled) shows as it is.
 */
const StepBadge: React.FC<{ order: Order; options: BillingOption[] }> = ({
  order,
  options,
}) => {
  const { steps, status } = useBillingSteps(order)
  const step = followsSteps(status) ? lastTicked(options, steps) : undefined

  if (!step) return <StatusBadge status={status} />

  return (
    <Badge
      className={`justify-center whitespace-nowrap ${
        BILLING_COLORS[step.color] ?? BILLING_COLORS.gray
      }`}
    >
      {tx(step.label)}
    </Badge>
  )
}

type OrderStatusType = {
  status: string
  order?: Order
  options?: BillingOption[]
}

const OrderStatus: React.FC<OrderStatusType> = ({ status, order, options }) =>
  order && options ? (
    <StepBadge order={order} options={options} />
  ) : (
    <StatusBadge status={status} />
  )

export default OrderStatus
