import { OrderStatusEnum } from "@/shared/enums";
import React, { useEffect } from "react";
import { Badge } from "flowbite-react";
import getOrderStatusStyle from "@/shared/helpers/getOrderStatusStyle";

type OrderStatusType = {
  status: string;
};

const OrderStatus: React.FC<OrderStatusType> = ({ status }) => {
  const statusStyle = getOrderStatusStyle(status);

  useEffect(() => {}, [statusStyle]);

  return (
    <Badge className={`justify-center max-w-[100px] ${statusStyle}`}>
      {status}
    </Badge>
  );
};

export default OrderStatus;
