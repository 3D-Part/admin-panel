import { Order } from "@/shared/types";
import { Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import OrderStatus from "../../OrderStatus/OrderStatus";
import { BiMessageDetail } from "react-icons/bi";
import OrderContactForm from "../../OrderContactForm";
import OrderEditModal from "../../OrderEditModal/OrderEditModal";

type TableItemType = {
  order: Order;
};

export const TableItem: React.FC<TableItemType> = ({ order }) => {
  const { fullName, email, city, price, status } = order;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell>{fullName}</Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>{city}</Table.Cell>
        <Table.Cell>{price}KM</Table.Cell>
        <Table.Cell
          onClick={() => setIsOrderModalOpen(true)}
          className="cursor-pointer"
        >
          <OrderStatus status={status} />
        </Table.Cell>
        <Table.Cell onClick={() => setIsFormModalOpen(true)}>
          <div className="text-xl cursor-pointer">
            <BiMessageDetail />
          </div>
        </Table.Cell>
      </Table.Row>

      <OrderContactForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialValue={order}
        setIsModalOpen={setIsFormModalOpen}
      />

      {isOrderModalOpen && (
        <OrderEditModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          initialValue={order}
          setIsModalOpen={setIsOrderModalOpen}
        />
      )}
    </>
  );
};
