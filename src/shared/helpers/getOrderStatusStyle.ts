import { OrderStatusEnum } from "../enums";

const getOrderStatusStyle = (status: string) => {
  switch (status) {
    case OrderStatusEnum.Pending:
      return "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-800";
    case OrderStatusEnum.Accepted:
      return "bg-green-900 text-green-600 dark:bg-green-900 dark:text-green-600";
    case OrderStatusEnum.Shipping:
      return "bg-cyan-500 text-cyan-900 dark:bg-cyan-500 dark:text-cyan-900";
    case OrderStatusEnum.Declined:
      return "bg-red-900 text-red-400 dark:bg-red-900 dark:text-red-400";
    case OrderStatusEnum.Finished:
      return "bg-transparent border-2 border-gray-400 text-gray-400 dark:bg-transparent border-2 border-gray-500 dark:text-gray-500";
    default:
      return "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-800";
  }
};

export default getOrderStatusStyle;
