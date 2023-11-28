"use client";

import { ProductAttributeAPI, ProductsAPI } from "@/services";
import { EditProductAttributeBody } from "@/shared/types";
import { useProductsStore } from "@/store/store";
import { Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { SyntheticEvent, useRef, useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { toast } from "react-toastify";

type AttributeEditFormType = {
  name: string;
  value: string;
  attributeId: string;
};

const AttributeEditForm: React.FC<AttributeEditFormType> = ({
  name,
  value,
  attributeId,
}) => {
  const [loader, setLoader] = useState(false);
  const attributeValue = useRef<string>();
  const [isValueChanged, setIsValueChanged] = useState(false);

  const { activeProduct, changeActiveProduct } = useProductsStore();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { value: inputValue } = e.target;

    if (inputValue !== value) {
      setIsValueChanged(true);
    } else {
      setIsValueChanged(false);
    }

    attributeValue.current = inputValue;
  };

  const removeAttribute = async () => {
    setLoader(true);
    // TODO Check res
    const res = await ProductAttributeAPI.removeProductAttribute(attributeId);
    if (res) {
      const toastMessage = `product attribute is removed`;
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
    }
    const _productData = await ProductsAPI.getOneProduct(activeProduct.id);
    if (_productData) {
      changeActiveProduct(_productData);
    }
    setLoader(false);
  };

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValueChanged || !attributeValue.current) return;

    const _body: EditProductAttributeBody = {
      value: attributeValue.current,
    };

    setLoader(true);
    const res = await ProductAttributeAPI.editProductAttribute(
      attributeId,
      _body
    );

    if (res) {
      const toastMessage = `product attribute is changed to ${attributeValue.current}`;
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
    }

    const _productData = await ProductsAPI.getOneProduct(activeProduct.id);
    if (_productData) {
      changeActiveProduct(_productData);
    }

    setLoader(false);
  };

  return (
    <div className="max-w-md">
      <form onSubmit={onSubmit}>
        <div className="w-full flex flex-col gap-2 justify-start items-start mt-2">
          <div className="mb-2 block">
            <Label className="text-xl" htmlFor="attribute-value" value={name} />
          </div>
          <div className="flex justify-start items-center gap-4">
            <TextInput
              name="attribute-value"
              onChange={handleInputChange}
              id="attribute-value"
              required
              type="text"
              defaultValue={value}
            />
            {isValueChanged && (
              <Button type="submit">
                <HiCheckCircle className="h-5 w-5" />
              </Button>
            )}
            <Button onClick={removeAttribute} color="failure">
              <HiXCircle className="h-5 w-5" />
            </Button>
            {loader && (
              <Spinner aria-label="Success spinner example" color="success" />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AttributeEditForm;
