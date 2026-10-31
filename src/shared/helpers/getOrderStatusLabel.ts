import { OrderStatusEnum } from '../enums'

/**
 * What each status is called on screen. The stored values stay as they are, so
 * existing orders keep working.
 */
const orderStatusLabels: Record<string, string> = {
  [OrderStatusEnum.Pending]: 'New',
  [OrderStatusEnum.Accepted]: 'Accepted',
  [OrderStatusEnum.ProformaSent]: 'Proforma sent',
  [OrderStatusEnum.Shipping]: 'Packing',
  [OrderStatusEnum.InvoiceIssued]: 'Receipt issued',
  [OrderStatusEnum.AwaitingPayment]: 'Awaiting payment',
  [OrderStatusEnum.Paid]: 'Paid',
  [OrderStatusEnum.InvoiceSent]: 'Invoice sent',
  [OrderStatusEnum.Finished]: 'Finished',
  [OrderStatusEnum.Returned]: 'Returned',
  [OrderStatusEnum.Declined]: 'Cancelled',
}

const getOrderStatusLabel = (status: string): string =>
  orderStatusLabels[status] ?? status

export default getOrderStatusLabel
