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
  // onWarningModalOpen: (product: ProductData) => void;
};

export const TableItem: React.FC<TableItemType> = ({ order }) => {
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

  useEffect(() => {
    switch (id) {
      case "62d7a110-5a56-11ee-919f-6dcd4c3d3ca7":
        setTest("PENDING");
        break;
      case "860a2780-5a50-11ee-919f-6dcd4c3d3ca7":
        setTest("ACCEPTED");
        break;
      case "ec46c480-5984-11ee-919f-6dcd4c3d3ca7":
        setTest("SHIPPED");
        break;
      case "b2d79dd0-5968-11ee-919f-6dcd4c3d3ca7":
        setTest("CANCELLED");
        break;
      case "0ad71d70-595b-11ee-919f-6dcd4c3d3ca7":
        setTest("REJECTED");
        break;
      case "43b917c0-5955-11ee-919f-6dcd4c3d3ca7":
        setTest("REFUNDED");
        break;
      case "7bfb2bc0-5953-11ee-919f-6dcd4c3d3ca7":
        setTest("ONHOLD");
        break;
      case "510454a0-5953-11ee-919f-6dcd4c3d3ca7":
        setTest("COMPLETED");
        break;

      default:
        setTest("PENDING");
        break;
    }
  }, [id]);

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell>{fullName}</Table.Cell>
        <Table.Cell>{email}</Table.Cell>
        <Table.Cell>{city}</Table.Cell>
        <Table.Cell>{price}KM</Table.Cell>
        <Table.Cell>
          <OrderStatus status={test} />
        </Table.Cell>
      </Table.Row>
    </>
  );
};
