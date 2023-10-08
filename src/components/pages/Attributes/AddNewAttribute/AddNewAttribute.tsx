"use client";

import { AttributeFormBody } from "@/shared/types";
import { useAttributesStore } from "@/store/store";
import { Button, Label, TextInput } from "flowbite-react";
import React, { SyntheticEvent, useRef, useState } from "react";
import AttributeHeader from "./components/AttributeHeader/AttributeHeader";
import { toast } from "react-toastify";
import { Loader } from "@/components/common";

type AddNewAttributeType = {
  initialValue?: AttributeFormBody;
};

const AddNewAttribute: React.FC<AddNewAttributeType> = ({ initialValue }) => {
  const [loader, setLoader] = useState(false);
  const attributeDataRef = useRef<AttributeFormBody>({} as AttributeFormBody);
  const formRef = useRef<HTMLFormElement>(null);

  const { fetchAllAttributes, allAttributes, addNewAttribute } =
    useAttributesStore();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    attributeDataRef.current = {
      ...attributeDataRef.current,
      [name]: value,
    };
  };

  const resetData = () => {
    formRef.current && formRef.current.reset();
    attributeDataRef.current = {} as AttributeFormBody;
  };

  const saveFunction = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!attributeDataRef.current.name) return;

    const _attribute: AttributeFormBody = {
      name: attributeDataRef.current.name,
    };

    const request = await addNewAttribute(_attribute);
    if (request) {
      toast(`${_attribute.name} is added!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });

      resetData();
    }
  };

  // const getAllAttributes = useCallback(async () => {
  //   const data = await fetchAllAttributes();
  //   if (data) {
  //     setLoader(false);
  //   } else {
  //     setLoader(true);
  //   }
  // }, [fetchAllAttributes]);

  // useEffect(() => {
  //   if (allAttributes.length > 0) {
  //     setLoader(false);
  //   } else {
  //     getAllAttributes();
  //   }
  // }, [allAttributes]);

  if (loader) {
    return (
      <div className="flex flex-col  w-full ">
        <AttributeHeader />
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col  w-full ">
      <AttributeHeader />

      <form
        ref={formRef}
        onSubmit={saveFunction}
        className="flex flex-col items-start gap-4 w-full max-w-xl  "
      >
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="attributeName" value="Attribute Name" />
          </div>
          <TextInput
            name="name"
            onChange={handleInputChange}
            id="attributeName"
            required
            type="text"
            defaultValue={initialValue?.name ? initialValue.name : ""}
          />
        </div>

        <Button className="mt-6" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
};

export default AddNewAttribute;
