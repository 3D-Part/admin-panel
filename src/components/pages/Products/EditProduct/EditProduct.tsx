"use client";

import React, { useEffect } from "react";
import { TabsMenu } from "./components/TabsMenu/TabsMenu";
import { useProductsStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { URLPartsEnum } from "@/shared/enums";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";

export const EditProduct = () => {
  const { activeProduct } = useProductsStore();

  const router = useRouter();

  useEffect(() => {
    if (activeProduct.id) return;

    router.push(URLPartsEnum.Products, { shallow: true });
  }, [activeProduct, router]);

  return (
    <div className="w-full">
      <div className="w-full flex justify-between gap-4 items-center mb-12 ">
        <h2 className="text-white text-4xl font-bold">{activeProduct.name}</h2>
        <Button href={URLPartsEnum.AddNewProduct}>
          Add new <HiPlus className="ml-2" />
        </Button>
      </div>
      <TabsMenu />
    </div>
  );
};
