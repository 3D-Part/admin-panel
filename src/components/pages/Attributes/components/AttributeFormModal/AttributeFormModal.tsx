"use client";

import { Loader } from "@/components/common";
import { AttributeFormBody, AttributeData } from "@/shared/types";
import { useAttributesStore } from "@/store/store";
import { Button, Label, Modal, Select, TextInput } from "flowbite-react";
import { SyntheticEvent, useEffect, useRef } from "react";

type ModalType = {
  isOpen: boolean;
  initialValue?: AttributeData;
  onSave: (attribute: AttributeFormBody) => void;
  onClose: () => void;
};

const AttributeFormModal: React.FC<ModalType> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
}) => {
  const attributeDataRef = useRef<AttributeData>({} as AttributeData);

  const { allAttributes } = useAttributesStore();

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
    attributeDataRef.current = {} as AttributeData;
  };

  const saveFunction = () => {
    if (!attributeDataRef.current.name) return;

    const _attribute: AttributeFormBody = {
      name: attributeDataRef.current.name,
    };

    onSave(_attribute);
    resetData();
  };

  useEffect(() => {
    if (!initialValue) return;

    attributeDataRef.current = initialValue;
  }, [initialValue]);
  if (!isOpen) return null;

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose}>
        <Modal.Header>Edit Attribute</Modal.Header>
        <Modal.Body>
          {allAttributes.length > 0 ? (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex max-w-md flex-col gap-4"
            >
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="attributeName" value="attributeName" />
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
            </form>
          ) : (
            <Loader />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={saveFunction}>Save</Button>
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AttributeFormModal;
