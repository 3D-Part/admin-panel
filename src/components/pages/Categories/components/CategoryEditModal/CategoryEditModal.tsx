"use client";

import { Loader } from "@/components/common";
import {
  CategoryAttributeData,
  CategoryData,
  CategoryFormBody,
} from "@/shared/types";
import { useCategoryStore } from "@/store/store";
import {
  Button,
  Label,
  Modal,
  Select,
  TextInput,
  Textarea,
} from "flowbite-react";
import { useEffect, useRef } from "react";
import CategoryAttribute from "../../CategoryAttribute/CategoryAttribute";
import { CategoryAttributeAPI } from "@/services";

type ModalType = {
  isOpen: boolean;
  initialValue?: CategoryData;
  onSave: (category: CategoryFormBody) => void;
  onClose: () => void;
};

const CategoryEditModal: React.FC<ModalType> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
}) => {
  const categoryDataRef = useRef<CategoryData>({} as CategoryData);
  const categoryAttributeIds = useRef<string[]>([]);

  const changeCategoryAttributeIds = (attributes: string[]) => {
    categoryAttributeIds.current = attributes;
  };

  const { allCategories } = useCategoryStore();
  const { addCategoryAttributesBulk, removeCategoryAttributesBulk } =
    CategoryAttributeAPI;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    categoryDataRef.current = {
      ...categoryDataRef.current,
      [name]: value,
    };
  };

  const resetData = () => {
    categoryDataRef.current = {} as CategoryData;
  };

  const removeAttributesFromCategory = async () => {
    const initAttributeIds = initialValue?.categoryAttributes.map(
      (catAttribute) => {
        return catAttribute.id;
      }
    );

    if (initAttributeIds && initAttributeIds?.length > 0) {
      await removeCategoryAttributesBulk(initAttributeIds);
    }
  };

  const updateAttributes = async (categoryId: string) => {
    const _data: CategoryAttributeData[] = [];

    await removeAttributesFromCategory();
    if (categoryAttributeIds.current.length === 0) return;

    categoryAttributeIds.current.forEach((attributeId) => {
      const _categoryAttribute = {
        categoryId: categoryId,
        attributeId: attributeId,
      };
      _data.push(_categoryAttribute);
    });

    await addCategoryAttributesBulk(_data);
  };

  const saveFunction = async () => {
    if (!categoryDataRef.current.name) return;

    const _category: CategoryFormBody = {
      name: categoryDataRef.current.name,
      slug: categoryDataRef.current.slug,
      description: categoryDataRef.current.description
        ? categoryDataRef.current.description
        : "",
    };

    if (categoryDataRef.current.parentCategoryId) {
      _category.parentCategoryId = categoryDataRef.current.parentCategoryId;
    }

    if (initialValue) {
      await updateAttributes(initialValue.id);
    }
    onSave(_category);
    resetData();
  };

  useEffect(() => {
    if (!initialValue) return;

    categoryDataRef.current = initialValue;
  }, [initialValue]);

  if (!isOpen) return null;

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose}>
        <Modal.Header>Edit Category t</Modal.Header>
        <Modal.Body>
          {allCategories.length > 0 ? (
            <form
              // onSubmit={saveFunction}
              className="flex max-w-md flex-col gap-4"
            >
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="categoryName" value="Category Name" />
                </div>
                <TextInput
                  name="name"
                  onChange={handleInputChange}
                  id="categoryName"
                  required
                  type="text"
                  defaultValue={initialValue?.name ? initialValue.name : ""}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="urlSlug" value="URL Slug" />
                </div>
                <TextInput
                  name="slug"
                  onChange={handleInputChange}
                  id="urlSlug"
                  required
                  type="text"
                  defaultValue={initialValue?.slug ? initialValue.slug : ""}
                />
              </div>

              <div className="w-full">
                <div className="mb-2 block">
                  <Label htmlFor="description" value="Description" />
                </div>
                <Textarea
                  onChange={handleInputChange}
                  defaultValue={
                    initialValue?.description ? initialValue?.description : ""
                  }
                  id="description"
                  name="description"
                  placeholder="Category description..."
                  rows={4}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="category" value="Parent Category" />
                </div>
                <Select
                  onChange={handleInputChange}
                  name="parentCategoryId"
                  id="category"
                  defaultValue={
                    initialValue?.parentCategoryId
                      ? initialValue?.parentCategoryId
                      : ""
                  }
                >
                  <option value={""}>None</option>
                  {allCategories.map((category) => {
                    return (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    );
                  })}
                </Select>
              </div>

              <CategoryAttribute
                onAttributesChange={changeCategoryAttributeIds}
                initialAttributes={initialValue?.categoryAttributes}
              />
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

export default CategoryEditModal;
