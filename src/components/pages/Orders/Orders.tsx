"use client";

import React, { useRef, useState } from "react";
import { OrdersTable } from "./components/OrdersTable/OrdersTable";
import OrderEditModal from "./components/OrderEditModal/OrderEditModal";
import { Order } from "@/shared/types";

const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeOrderRef = useRef<Order>();

  const openEditModal = (order: Order) => {
    activeOrderRef.current = order;
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <OrdersTable openEditModal={openEditModal} />

      <OrderEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialValue={activeOrderRef.current}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default Orders;
