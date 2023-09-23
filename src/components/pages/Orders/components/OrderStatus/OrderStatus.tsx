import { OrderStatusEnum } from "@/shared/enums";
import React, { useEffect, useState } from "react";
import { Badge } from "flowbite-react";

type OrderStatusType = {
  status: string;
};

const OrderStatus: React.FC<OrderStatusType> = ({ status }) => {
  const [statusColor, setStatusColor] = useState("info");

  useEffect(() => {
    switch (status) {
      case OrderStatusEnum.Pending:
      case OrderStatusEnum.Shipped:
        setStatusColor("info");
        break;
      case OrderStatusEnum.Processing:
        setStatusColor("indigo");
        break;
      case OrderStatusEnum.Rejected:
        setStatusColor("failure");
        break;
      case OrderStatusEnum.OnHold:
      case OrderStatusEnum.Cancelled:
        setStatusColor("warning");
        break;
      case OrderStatusEnum.Delivered:
      case OrderStatusEnum.Completed:
        setStatusColor("success");
        break;
      default:
        setStatusColor("dark");
        break;
    }
  }, [status]);

  return (
    <Badge color={statusColor} className="justify-center">
      {status}
    </Badge>
  );
};

export default OrderStatus;
