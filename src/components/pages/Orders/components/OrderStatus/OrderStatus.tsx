'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Badge } from 'flowbite-react'
import getOrderStatusStyle from '@/shared/helpers/getOrderStatusStyle'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'
import { Order } from '@/shared/types'
import {
  BILLING_COLORS,
  StepLists,
  listFor,
  statusOf,
} from '@/shared/helpers/billingOptions'
import { OrderStatusEnum } from '@/shared/enums'
import { followsSteps, lastTicked, useBillingSteps } from './billingStepsStore'

const QUIET_STATUSES: string[] = [OrderStatusEnum.Pending, OrderStatusEnum.Accepted]

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
const StepBadge: React.FC<{ order: Order; lists: StepLists }> = ({
  order,
  lists,
}) => {
  const { steps, status } = useBillingSteps(order)
  const options = listFor(lists, status, order.isOffer)
  const step = followsSteps(status, options, steps) ? lastTicked(options, steps) : undefined

  // New and Accepted show no badge, the circles say enough
  const shownStatus = step ? statusOf(step) : status
  if (shownStatus && QUIET_STATUSES.includes(shownStatus)) return null

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
  lists?: StepLists
}

const OrderStatus: React.FC<OrderStatusType> = ({ status, order, lists }) =>
  order && lists ? (
    <StepBadge order={order} lists={lists} />
  ) : (
    <StatusBadge status={status} />
  )

export default OrderStatus
