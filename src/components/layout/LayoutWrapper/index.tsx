"use client";

import { URLPart } from "@/shared/enums";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "../Header/Header";
import SideBar from "../SideBar/SideBar";

const LayoutWrapper = () => {
  const pathname = usePathname();
  const isLoginPage = pathname === URLPart.Login;

  if (isLoginPage) return;

  return (
    <>
      <Header />
      <SideBar />
    </>
  );
};

export default LayoutWrapper;
