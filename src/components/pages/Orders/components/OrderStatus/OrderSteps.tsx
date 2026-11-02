import React from 'react'
import { ORDER_STEPS, OrderStatusEnum } from '@/shared/enums'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'

const STEP_COLORS: Record<string, string> = {
  [OrderStatusEnum.Accepted]: 'bg-yellow-400 border-yellow-400',
  [OrderStatusEnum.Preparing]: 'bg-white border-gray-400',
  [OrderStatusEnum.Shipping]: 'bg-blue-500 border-blue-500',
  [OrderStatusEnum.Finished]: 'bg-green-500 border-green-500',
}

// How many steps are done. Older statuses all came after the receipt.
const stepsDone = (status: string) => {
  const index = ORDER_STEPS.indexOf(status as OrderStatusEnum)
  if (index >= 0) return index + 1
  if (status === OrderStatusEnum.ReadyForPickup) return 2
  return [
    OrderStatusEnum.InvoiceIssued,
    OrderStatusEnum.AwaitingPayment,
    OrderStatusEnum.Paid,
    OrderStatusEnum.InvoiceSent,
  ].includes(status as OrderStatusEnum)
    ? ORDER_STEPS.length
    : 0
}

const OrderSteps: React.FC<{ status: string }> = ({ status }) => {
  const done = stepsDone(status)

  return (
    <div
      className="flex items-center gap-1 shrink-0"
      aria-label={`${done} of ${ORDER_STEPS.length} steps done`}
    >
      {ORDER_STEPS.map((step, index) => (
        <span
          key={step}
          title={getOrderStatusLabel(step)}
          className={`w-3 h-3 rounded-full border ${
            index < done
              ? STEP_COLORS[step]
              : 'bg-transparent border-gray-300 dark:border-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

export default OrderSteps
