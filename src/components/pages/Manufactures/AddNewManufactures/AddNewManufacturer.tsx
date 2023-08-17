"use client";

import { ManufacturerFormBody } from "@/shared/types";
import { useManufactureStore } from "@/store/store";
import { Button, Label, TextInput } from "flowbite-react";
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ManufacturerHeader from "./components/Header/Header";
import { toast } from "react-toastify";
import { Loader } from "@/components/common";

type AddNewManufacturerType = {
  initialValue?: ManufacturerFormBody;
};

const AddNewManufacturer: React.FC<AddNewManufacturerType> = ({
  initialValue,
}) => {
  const [loader, setLoader] = useState(false);
  const manufacturerDataRef = useRef<ManufacturerFormBody>(
    {} as ManufacturerFormBody
  );
  const formRef = useRef<HTMLFormElement>(null);

  const { fetchAllManufactures, allManufactures, addNewManufacture } =
    useManufactureStore();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    manufacturerDataRef.current = {
      ...manufacturerDataRef.current,
      [name]: value,
    };
  };

  const resetData = () => {
    formRef.current && formRef.current.reset();
    manufacturerDataRef.current = {} as ManufacturerFormBody;
  };

  const saveFunction = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!manufacturerDataRef.current.name) return;

    const _manufacturer: ManufacturerFormBody = {
      name: manufacturerDataRef.current.name,
    };

    const request = await addNewManufacture(_manufacturer);
    if (request) {
      toast(`${_manufacturer.name} is added!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });

      resetData();
    }
  };

  // const getAllManufactures = useCallback(async () => {
  //   const data = await fetchAllManufactures();
  //   if (data) {
  //     setLoader(false);
  //   } else {
  //     setLoader(true);
  //   }
  // }, [fetchAllManufactures]);

  // useEffect(() => {
  //   getAllManufactures();
  // }, [getAllManufactures]);

  // TODO need to be cached
  // useEffect(() => {
  //   // if (allManufactures.length > 0) {
  //   //   setLoader(false);
  //   // } else {
  //   //   getAllManufactures();
  //   // }
  //   getAllManufactures();
  // }, []);
  // }, [allManufactures]);

  if (loader) {
    return (
      <div className="flex flex-col  w-full ">
        <ManufacturerHeader />
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col  w-full ">
      <ManufacturerHeader />

      <form
        ref={formRef}
        onSubmit={saveFunction}
        className="flex flex-col items-start gap-4 w-full max-w-xl  "
      >
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="manufacturerName" value="Manufacturer Name" />
          </div>
          <TextInput
            name="name"
            onChange={handleInputChange}
            id="manufacturerName"
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

export default AddNewManufacturer;
