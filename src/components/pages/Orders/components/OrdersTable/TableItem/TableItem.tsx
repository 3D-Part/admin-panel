import { OrderStatusEnum, URLPartsEnum } from "@/shared/enums";

import { PaginationData, Order, ProductFormBody } from "@/shared/types";
import { useProductsStore } from "@/store/store";
import { Avatar, Dropdown, Table } from "flowbite-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiDotsVertical } from "react-icons/hi";
import { toast } from "react-toastify";
import OrderStatus from "../../OrderStatus/OrderStatus";

type TableItemType = {
  order: Order;
  openEditModal: (order: Order) => void;
};

export const TableItem: React.FC<TableItemType> = ({
  order,
  openEditModal,
}) => {
  const [test, setTest] = useState("");
  const { id, fullName, email, city, price, status } = order;

  const {
    changeActiveProduct,
    addNewProducts,
    currentPage,
    itemsPerPage,
    fetchProducts,
  } = useProductsStore();

  // Make this function global
  const fetchProductsData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };
    await fetchProducts(paginationData);
  };

  // const editProduct = () => {
  //   changeActiveProduct(product);
  //   router.push(URLPartsEnum.EditProduct, { shallow: true });
  // };

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell>{fullName}</Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>{city}</Table.Cell>
        <Table.Cell>{price}KM</Table.Cell>
        <Table.Cell
          className="cursor-pointer"
          onClick={() => openEditModal(order)}
        >
          <OrderStatus status={status} />
        </Table.Cell>
      </Table.Row>
    </>
  );
};
