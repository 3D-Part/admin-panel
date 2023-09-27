"use client";

import React, { useEffect } from "react";
import { useProductsStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { URLPart } from "@/shared/enums";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { TabsMenu } from "@/components/pages/Products/EditProduct/components/TabsMenu/TabsMenu";

export const EditProduct = () => {
  const { activeProduct } = useProductsStore();

  const router = useRouter();

  useEffect(() => {
    if (activeProduct.id) return;

    router.push(URLPart.Products, { shallow: true });
  }, [activeProduct, router]);

  return (
    <div className="w-full">
      <div className="w-full flex justify-between gap-4 items-center mb-12 ">
        <h2 className="text-white text-4xl font-bold">{activeProduct.name}</h2>
        <Button href={URLPart.AddNewProduct}>
          Add neww <HiPlus className="ml-2" />
        </Button>
      </div>
      <TabsMenu />
    </div>
  );
};
