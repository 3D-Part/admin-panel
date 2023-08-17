import { URLPart } from "@/shared/enums";
import { ProductData } from "@/shared/types";
import { useProductsStore } from "@/store/store";
import { Avatar, Table } from "flowbite-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type TableItemType = {
  product: ProductData;
  onWarningModalOpen: (product: ProductData) => void;
};

const S3_URL = process.env.S3_URL;

export const TableItem: React.FC<TableItemType> = ({
  product,
  onWarningModalOpen,
}) => {
  const [activeImageId, setActiveImageId] = useState("");
  const { name, category, manufacturer, sku, price, quantity, images } =
    product;

  useEffect(() => {
    if (images.length === 0) return;

    const mainImage = images.find((image) => image.isMain);
    const _activeImageId = mainImage ? mainImage.imageId : images[0].imageId;
    setActiveImageId(`${S3_URL}/${_activeImageId}`);
  }, [images]);

  const { changeActiveProduct } = useProductsStore();
  const router = useRouter();

  const editProduct = () => {
    changeActiveProduct(product);
    router.push(URLPart.EditProduct);
  };

  return (
    <>
      <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          <div className="flex justify-start items-center gap-6">
            <Avatar
              alt="product"
              placeholderInitials="3D"
              img={activeImageId}
              size="md"
              rounded
              className="custom_avatar_img "
            />
            {name}
          </div>
        </Table.Cell>
        <Table.Cell>{category ? category.name : "/"}</Table.Cell>
        <Table.Cell>{manufacturer ? manufacturer.name : ""}</Table.Cell>
        <Table.Cell>{sku}</Table.Cell>
        <Table.Cell>{price}KM</Table.Cell>
        <Table.Cell>{quantity}</Table.Cell>
        <Table.Cell>
          <div className="flex justify-end items-center gap-8">
            <span
              onClick={editProduct}
              className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500"
            >
              <p>Edit</p>
            </span>
            <span
              onClick={() => onWarningModalOpen(product)}
              className="font-medium text-red-500 cursor-pointer hover:underline dark:text-red-500"
            >
              <p>Remove</p>
            </span>
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  );
};
