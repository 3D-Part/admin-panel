"use client";

import { URLPart } from "@/shared/enums";
import { usePathname } from "next/navigation";
import React from "react";

const ChildrenWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === URLPart.Login;

  return (
    <div
      className={`ml-0 flex items-center justify-center p-12 mt-16 ${
        !isLoginPage ? "md:ml-64" : ""
      } `}
    >
      {children}
    </div>
  );
};

export default ChildrenWrapper;
