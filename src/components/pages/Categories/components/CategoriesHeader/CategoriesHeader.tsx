"use client"; // This is a client component 👈🏽

import React from "react";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { URLPartsEnum } from "@/shared/enums";
import CategoriesSearch from "./CategoriesSearch";

export const CategoriesHeader = () => {
  const router = useRouter();

  return (
    <div className="w-full flex justify-between items-center">
      <CategoriesSearch />
      <Button
        className="cursor-pointer"
        onClick={() =>
          router.push(URLPartsEnum.AddNewCategory, { shallow: true })
        }
      >
        Add new <HiPlus className="ml-2" />
      </Button>
    </div>
  );
};
