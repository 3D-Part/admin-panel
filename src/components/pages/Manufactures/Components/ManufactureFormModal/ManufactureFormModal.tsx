"use client";

import { Loader } from "@/components/common";
import { ManufacturerFormBody, ManufacturerData } from "@/shared/types";
import { useManufactureStore } from "@/store/store";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { SyntheticEvent, useEffect, useRef } from "react";

type ModalType = {
  isOpen: boolean;
  initialValue?: ManufacturerData;
  onSave: (manufacturer: ManufacturerFormBody) => void;
  onClose: () => void;
};

const ManufactureFormModal: React.FC<ModalType> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
}) => {
  const manufacturerDataRef = useRef<ManufacturerData>({} as ManufacturerData);

  const { allManufactures } = useManufactureStore();

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
    manufacturerDataRef.current = {} as ManufacturerData;
  };

  const saveFunction = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!manufacturerDataRef.current.name) return;

    const _manufacturer: ManufacturerFormBody = {
      name: manufacturerDataRef.current.name,
    };

    onSave(_manufacturer);
    resetData();
  };

  useEffect(() => {
    if (!initialValue) return;

    manufacturerDataRef.current = initialValue;
  }, [initialValue]);
  if (!isOpen) return null;

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose}>
        <Modal.Header>Edit Manufacturer</Modal.Header>
        <Modal.Body>
          {allManufactures.length > 0 ? (
            <form
              onSubmit={saveFunction}
              className="flex max-w-md flex-col gap-4"
            >
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="manufacturerName" value="ManufacturerName" />
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
            </form>
          ) : (
            <Loader />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Save</Button>
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ManufactureFormModal;
