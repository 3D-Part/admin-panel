import { URLPartsEnum } from "@/shared/enums";

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

const S3_URL = process.env.S3_URL;

export const TableItem: React.FC<TableItemType> = ({ order }) => {
  const [activeImageId, setActiveImageId] = useState("");
  const { fullName, email, city, price, status } = order;

  const router = useRouter();

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
        <Table.Cell>
          <OrderStatus status={status} />
        </Table.Cell>
      </Table.Row>
    </>
  );
};
