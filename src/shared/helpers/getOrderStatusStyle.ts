import { OrderStatusEnum } from '../enums'

const getOrderStatusStyle = (status: string) => {
  switch (status) {
    case OrderStatusEnum.Pending:
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    case OrderStatusEnum.Accepted:
      return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-950'
    case OrderStatusEnum.Preparing:
      return 'bg-white border border-gray-300 text-gray-800 dark:bg-gray-100 dark:text-gray-900'
    case OrderStatusEnum.Shipping:
      return 'bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-white'
    case OrderStatusEnum.InvoiceIssued:
    case OrderStatusEnum.AwaitingPayment:
    case OrderStatusEnum.Paid:
    case OrderStatusEnum.InvoiceSent:
    case OrderStatusEnum.Finished:
      return 'bg-green-200 text-green-900 dark:bg-green-600 dark:text-white'
    case OrderStatusEnum.ReadyForPickup:
      return 'bg-pink-200 text-pink-900 dark:bg-pink-500 dark:text-white'
    case OrderStatusEnum.ProformaSent:
      return 'bg-amber-200 text-amber-950 dark:bg-amber-800 dark:text-amber-100'
    case OrderStatusEnum.Returned:
      return 'bg-orange-300 text-orange-950 dark:bg-orange-500 dark:text-white'
    case OrderStatusEnum.Declined:
      return 'bg-red-200 text-red-900 dark:bg-red-700 dark:text-white'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

export default getOrderStatusStyle
