import { OrderStatusEnum } from "@/shared/enums";
import React, { useEffect, useState } from "react";
import { Badge } from "flowbite-react";

type OrderStatusType = {
  status: string;
};

const OrderStatus: React.FC<OrderStatusType> = ({ status }) => {
  const [statusStyle, setStatusStyle] = useState("");

  useEffect(() => {
    switch (status) {
      case OrderStatusEnum.Pending:
        setStatusStyle(
          "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-800"
        );
        break;
      case OrderStatusEnum.Accepted:
        setStatusStyle(
          "bg-emerald-900 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-600"
        );
        break;

      case OrderStatusEnum.Shipping:
        setStatusStyle(
          "bg-cyan-500 text-cyan-950 dark:bg-cyan-500 dark:text-cyan-950"
        );

      case OrderStatusEnum.Declined:
        setStatusStyle(
          "bg-red-200 text-red-300 dark:bg-red-500 dark:text-red-300"
        );
        break;

      case OrderStatusEnum.Finished:
        setStatusStyle(
          "bg-sky-950 text-sky-600 dark:bg-sky-950 dark:text-sky-600"
        );
        break;

      default:
        setStatusStyle(
          "bg-green-400 text-green-800 dark:bg-green-400 dark:text-green-800"
        );
        break;
    }
  }, [status]);

  return (
    <Badge className={`justify-center max-w-[100px] ${statusStyle}`}>
      {status}
    </Badge>
  );
};

export default OrderStatus;
