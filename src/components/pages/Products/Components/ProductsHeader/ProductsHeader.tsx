"use client"; // This is a client component 👈🏽

import React from "react";
// import { Search } from "@/components/common";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { URLPart } from "@/shared/enums";

export const ProductsOverviewHeader = () => {
  return (
    <div className="w-full flex justify-between items-center">
      {/* <Search value="Search" /> */}
      <Button href={URLPart.AddNewProduct}>
        Add new <HiPlus className="ml-2" />
      </Button>
    </div>
  );
};
