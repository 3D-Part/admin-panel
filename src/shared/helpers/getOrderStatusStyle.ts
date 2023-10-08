import { OrderStatusEnum } from "../enums";

const getOrderStatusStyle = (status: string) => {
  switch (status) {
    case OrderStatusEnum.Pending:
      return "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-800";
    case OrderStatusEnum.Accepted:
      return "bg-emerald-900 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-600";
    case OrderStatusEnum.Shipping:
      return "bg-cyan-500 text-cyan-950 dark:bg-cyan-500 dark:text-cyan-950";
    case OrderStatusEnum.Declined:
      return "bg-red-200 text-red-300 dark:bg-red-500 dark:text-red-300";
    case OrderStatusEnum.Finished:
      return "bg-sky-950 text-sky-600 dark:bg-sky-950 dark:text-sky-600";
    default:
      return "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-800";
  }
};

export default getOrderStatusStyle;
