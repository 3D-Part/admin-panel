"use client";

import React from "react";
import AddAttribute from "./components/AddAttribute/AddAttribute";
import AttributesPresenter from "./components/AttributesPresenter/AttributesPresenter";

const ProductAttributes = () => {
  return (
    <div className="flex flex-col gap-24">
      <AddAttribute />
      <AttributesPresenter />
    </div>
  );
};

export default ProductAttributes;
