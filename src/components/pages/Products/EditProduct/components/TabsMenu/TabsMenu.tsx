"use client";

import { HiAdjustments, HiUserCircle } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import GeneralInfo from "../GeneralInfo/GeneralInfo";
import ProductAttributes from "../ProductAttributes/ProductAttributes";
import Gallery from "../Gallery/Gallery";
import { useState } from "react";
import Tabs from "@/components/common/Tabs/Tabs";

export const TabsMenu = () => {
  const [activeTab, setActiveTab] = useState(1);

  const ActiveComponent = () => {
    switch (activeTab) {
      case 1:
        return <GeneralInfo />;
      case 2:
        return <Gallery />;
      case 3:
        return <ProductAttributes />;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col w-full ">
      <Tabs.Group>
        <Tabs.Item onClick={() => setActiveTab(1)} active={activeTab === 1}>
          <HiUserCircle className="text-2xl" />
          General Info
        </Tabs.Item>
        <Tabs.Item onClick={() => setActiveTab(2)} active={activeTab === 2}>
          <MdDashboard className="text-2xl" />
          Gallery
        </Tabs.Item>
        <Tabs.Item onClick={() => setActiveTab(3)} active={activeTab === 3}>
          <HiAdjustments className="text-2xl" />
          Attributes
        </Tabs.Item>
      </Tabs.Group>

      <ActiveComponent />
    </div>
  );
};
