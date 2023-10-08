"use client"; // This is a client component 👈🏽

import React from "react";
// import { Search } from "@/components/common";
import { Button } from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { URLPartsEnum } from "@/shared/enums";

export const AttributesHeader = () => {
  const router = useRouter();

  return (
    <div className="w-full flex justify-between items-center">
      {/* <Search value="Search" /> */}
      <Button
        className="cursor-pointer"
        onClick={() =>
          router.push(URLPartsEnum.AddNewAttribute, { shallow: true })
        }
      >
        Add new <HiPlus className="ml-2" />
      </Button>
    </div>
  );
};
