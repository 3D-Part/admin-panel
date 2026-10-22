import { OrderStatusEnum } from '../enums'

const getOrderStatusStyle = (status: string) => {
  switch (status) {
    case OrderStatusEnum.Pending:
      return 'bg-green-200 text-green-800 dark:bg-green-400 dark:text-green-800'
    case OrderStatusEnum.Accepted:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-600'
    case OrderStatusEnum.ProformaSent:
    case OrderStatusEnum.InvoiceIssued:
    case OrderStatusEnum.InvoiceSent:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case OrderStatusEnum.Shipping:
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500 dark:text-cyan-900'
    case OrderStatusEnum.AwaitingPayment:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case OrderStatusEnum.Paid:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    case OrderStatusEnum.Returned:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case OrderStatusEnum.Declined:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
    case OrderStatusEnum.Finished:
      return 'bg-gray-100 border-2 border-gray-300 text-gray-600 dark:bg-transparent dark:border-gray-500 dark:text-gray-500'
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-400 dark:text-green-800'
  }
}

export default getOrderStatusStyle
