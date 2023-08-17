"use client";

import { CategoryAttributeData, CategoryFormBody } from "@/shared/types";
import { useCategoryStore } from "@/store/store";
import { Button, Label, Select, TextInput, Textarea } from "flowbite-react";
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import CategoryHeader from "./components/Header/Header";
import { toast } from "react-toastify";
import { Loader } from "@/components/common";
import CategoryAttribute from "../CategoryAttribute/CategoryAttribute";
import { CategoryAttributeAPI } from "@/services";

type AddNewCategoryType = {
  initialValue?: CategoryFormBody;
};

const AddNewCategory: React.FC<AddNewCategoryType> = ({ initialValue }) => {
  const [loader, setLoader] = useState(true);
  const categoryDataRef = useRef<CategoryFormBody>({} as CategoryFormBody);
  const formRef = useRef<HTMLFormElement>(null);
  const categoryAttributeIds = useRef<string[]>([]);
  const [slug, setSlug] = useState(initialValue?.slug);

  const { fetchAllCategories, allCategories, addNewCategory } =
    useCategoryStore();

  const { addCategoryAttributesBulk } = CategoryAttributeAPI;

  const changeCategoryAttributeIds = (attributes: string[]) => {
    categoryAttributeIds.current = attributes;
  };

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

  const onBlurInput = () => {
    if (categoryDataRef.current.name && !categoryDataRef.current.slug) {
      const _slug = categoryDataRef.current.name
        .toLocaleLowerCase()
        .replace(/ /g, "-");
      setSlug(_slug);
      categoryDataRef.current.slug = _slug;
    }
  };

  const resetData = () => {
    formRef.current && formRef.current.reset();
    categoryDataRef.current = {} as CategoryFormBody;
    setSlug("");
  };

  const saveAttributes = async (categoryId: string) => {
    const _data: CategoryAttributeData[] = [];

    if (categoryAttributeIds.current.length === 0) return;

    categoryAttributeIds.current.forEach((attributeId) => {
      const _categoryAttribute = {
        categoryId: categoryId,
        attributeId: attributeId,
      };
      _data.push(_categoryAttribute);
    });

    const response = await addCategoryAttributesBulk(_data);
    if (response) {
      toast(`Category attributes are added!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
    }
  };

  const saveFunction = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryDataRef.current.name) return;

    const _category: CategoryFormBody = {
      name: categoryDataRef.current.name,
      slug: categoryDataRef.current.slug,
      parentCategoryId: null,
      description: categoryDataRef.current.description,
    };

    if (categoryDataRef.current.parentCategoryId) {
      _category.parentCategoryId = categoryDataRef.current.parentCategoryId;
    }

    categoryDataRef.current.parentCategoryId = null;

    const response = await addNewCategory(_category);

    if (response && typeof response !== "boolean") {
      toast(`${_category.name} is added!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });

      const res = await saveAttributes(response.id);
      resetData();
    }
  };

  const getAllCategories = useCallback(async () => {
    const data = await fetchAllCategories();
    if (data) {
      setLoader(false);
    } else {
      setLoader(true);
    }
  }, [fetchAllCategories]);

  // useEffect(() => {
  //   getAllCategories();
  // }, [getAllCategories]);

  useEffect(() => {
    if (allCategories.length > 0) {
      setLoader(false);
    } else {
      getAllCategories();
    }
  }, [allCategories]);

  if (loader) {
    return (
      <div className="flex flex-col  w-full ">
        <CategoryHeader />
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col  w-full ">
      <CategoryHeader />

      <form
        ref={formRef}
        onSubmit={saveFunction}
        className="flex flex-col items-start gap-4 w-full max-w-xl  "
      >
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="categoryName" value="Category Name" />
          </div>
          <TextInput
            name="name"
            onChange={handleInputChange}
            onBlur={onBlurInput}
            id="categoryName"
            required
            type="text"
            defaultValue={initialValue?.name ? initialValue.name : ""}
          />
        </div>

        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="urlSlut" value="URL Slug" />
          </div>
          <TextInput
            name="slug"
            onChange={handleInputChange}
            id="urlSlut"
            required
            type="text"
            defaultValue={slug}
          />
        </div>

        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="description" value="Description" />
          </div>
          <Textarea
            onChange={handleInputChange}
            id="description"
            name="description"
            placeholder="Category description..."
            rows={4}
          />
        </div>

        <div className="w-full">
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

        <CategoryAttribute onAttributesChange={changeCategoryAttributeIds} />

        <Button className="mt-6" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
};

export default AddNewCategory;
