import { OrderStatusEnum } from '../enums'

/**
 * What the shop calls each status. The stored values stay in English so the
 * existing orders keep working; only the screen speaks Bosnian.
 */
const orderStatusLabels: Record<string, string> = {
  [OrderStatusEnum.Pending]: 'Nova',
  [OrderStatusEnum.Accepted]: 'Prihvaćeno',
  [OrderStatusEnum.ProformaSent]: 'Predračun poslan',
  [OrderStatusEnum.Shipping]: 'Roba se pakuje',
  [OrderStatusEnum.InvoiceIssued]: 'Račun otkucan',
  [OrderStatusEnum.AwaitingPayment]: 'Roba čeka uplatu',
  [OrderStatusEnum.Paid]: 'Roba uplaćena',
  [OrderStatusEnum.InvoiceSent]: 'Faktura poslana',
  [OrderStatusEnum.Finished]: 'Kraj',
  [OrderStatusEnum.Returned]: 'Roba vraćena',
  [OrderStatusEnum.Declined]: 'Otkazano',
}

const getOrderStatusLabel = (status: string): string =>
  orderStatusLabels[status] ?? status

export default getOrderStatusLabel
