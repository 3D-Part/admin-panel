import { OrderStatusEnum } from "@/shared/enums";
import React from "react";
import { Badge } from "flowbite-react";
import getOrderStatusStyle from "@/shared/helpers/getOrderStatusStyle";

type OrderStatusType = {
  status: string;
};

const OrderStatus: React.FC<OrderStatusType> = ({ status }) => {
  const statusStyle = getOrderStatusStyle(status);

  return (
    <Badge className={`justify-center max-w-[100px] ${statusStyle}`}>
      {status}
    </Badge>
  );
};

export default OrderStatus;
