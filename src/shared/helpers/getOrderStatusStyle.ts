import { OrderStatusEnum } from '../enums'

const getOrderStatusStyle = (status: string) => {
  switch (status) {
    case OrderStatusEnum.Pending:
      return 'bg-green-200 text-green-800 dark:bg-green-400 dark:text-green-800'
    case OrderStatusEnum.Accepted:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-600'
    case OrderStatusEnum.Shipping:
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500 dark:text-cyan-900'
    case OrderStatusEnum.Declined:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400'
    case OrderStatusEnum.Finished:
      return 'bg-gray-100 border-2 border-gray-300 text-gray-600 dark:bg-transparent dark:border-gray-500 dark:text-gray-500'
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-400 dark:text-green-800'
  }
}

export default getOrderStatusStyle
