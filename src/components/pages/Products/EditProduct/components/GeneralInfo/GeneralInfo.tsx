"use client";
import { Loader } from "@/components/common";
import {
  useManufactureStore,
  useCategoryStore,
  useProductsStore,
} from "@/store/store";
import {
  Button,
  Label,
  Select,
  TextInput,
  Textarea,
  ToggleSwitch,
} from "flowbite-react";
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ProductFormBody } from "@/shared/types";
import { toast } from "react-toastify";

const GeneralInfo = () => {
  const [isPublished, setIsPublished] = useState(true);
  const [isMostSold, setIsMostSold] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [loader, setLoader] = useState(true);

  const [parentCategory, setParentCategoryId] = useState("");

  // STORE DATA
  const { editProduct, activeProduct } = useProductsStore();
  const { fetchAllManufactures, allManufactures } = useManufactureStore();
  const { fetchAllCategories, allCategories } = useCategoryStore();

  const productDataRef = useRef<ProductFormBody>({} as ProductFormBody);
  const formRef = useRef<HTMLFormElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    productDataRef.current = {
      ...productDataRef.current,
      [name]: value,
    };
  };

  const resetData = () => {
    formRef.current && formRef.current.reset();
    productDataRef.current = {} as ProductFormBody;
    setIsPublished(true);
    setIsMostSold(false);
    setIsRecommended(false);
  };

  const changeIsPublished = () => {
    setIsPublished(!isPublished);
  };

  const changeIsMostSold = () => {
    setIsMostSold(!isMostSold);
  };
  const changeIsRecommended = () => {
    setIsRecommended(!isRecommended);
  };

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productDataRef.current.name) return;

    productDataRef.current.isPublished = isPublished;
    productDataRef.current.isMostSold = isMostSold;
    productDataRef.current.isRecommended = isRecommended;

    const request = await editProduct(activeProduct.id, productDataRef.current);
    if (request) {
      toast(`${productDataRef.current.name} is changed!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });

      resetData();
    }
  };

  // GET MANUFACTURES
  const getAllManufactures = useCallback(async () => {
    setLoader(true);
    const data = await fetchAllManufactures();
    setLoader(false);
    // if (data) {
    //   setLoader(false);
    // } else {
    //   setLoader(true);
    // }
  }, [fetchAllManufactures]);

  // TODO need to be cached
  useEffect(() => {
    // if (allManufactures.length > 0) {
    //   setLoader(false);
    // } else {
    //   getAllManufactures();
    // }
    getAllManufactures();
  }, []);
  // }, [allManufactures, getAllManufactures]);

  // GET CATEGORIES
  const getAllCategories = useCallback(async () => {
    setLoader(true);
    const data = await fetchAllCategories();
    setLoader(false);
    // if (data) {
    //   setLoader(false);
    // } else {
    //   setLoader(true);
    // }
  }, [fetchAllCategories]);

  useEffect(() => {
    const _activeProductFormData: ProductFormBody = {
      name: activeProduct.name,
      isPublished: activeProduct.isPublished,
      isMostSold: activeProduct.isMostSold,
      isRecommended: activeProduct.isRecommended,
      sku: activeProduct.sku,
      categoryId: activeProduct.categoryId,
      price: activeProduct.price,
      weight: activeProduct.weight,
      quantity: activeProduct.quantity,
    };

    if (activeProduct.description) {
      _activeProductFormData.description = activeProduct.description;
    }
    if (activeProduct.details) {
      _activeProductFormData.details = activeProduct.details;
    }
    if (activeProduct.manufacturerId) {
      _activeProductFormData.manufacturerId = activeProduct.manufacturerId;
    }

    productDataRef.current = _activeProductFormData;
  }, [activeProduct]);

  // TODO need to be cached
  useEffect(() => {
    // if (allCategories.length > 0) {
    //   setLoader(false);
    // } else {
    //   getAllCategories();
    // }
    getAllCategories();
  }, []);
  // }, [allCategories, getAllCategories]);

  useEffect(() => {
    setIsPublished(activeProduct.isPublished);
    setIsMostSold(activeProduct.isMostSold);
    setIsRecommended(activeProduct.isRecommended);
    if (activeProduct.category) {
      setParentCategoryId(activeProduct.category.id);
    }
  }, [activeProduct]);

  if (loader || !activeProduct || allCategories.length === 0) return <Loader />;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex items-start max-w-2xl flex-col gap-4"
    >
      {/* NAME */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label
            className="text-base"
            htmlFor="name"
            defaultValue="Product name"
          />
        </div>
        <TextInput
          name="name"
          onChange={handleInputChange}
          id="name"
          required
          type="text"
          defaultValue={activeProduct.name}
        />
      </div>

      {/* SKU */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="sku" value="SKU" />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="sku"
          name="sku"
          required
          type="text"
          defaultValue={activeProduct.sku}
        />
      </div>

      {/* PRICE */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="price" value="Price" />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="price"
          name="price"
          required
          type="number"
          step="0.01"
          defaultValue={activeProduct.price}
        />
      </div>

      {/* WEIGHT */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="weight" value="Weight" />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="weight"
          name="weight"
          required
          type="number"
          step="0.01"
          defaultValue={activeProduct.weight ? activeProduct.weight : ""}
        />
      </div>

      {/* QUANTITY */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="quantity" value="Quantity" />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="quantity"
          name="quantity"
          required
          type="number"
          defaultValue={activeProduct.quantity ? activeProduct.quantity : ""}
        />
      </div>

      {/* CATEGORY */}
      <div className="w-full" id="select">
        <div className="mb-2 block">
          <Label htmlFor="categoryId" value="Category" />
        </div>

        <Select
          onChange={handleInputChange}
          name="categoryId"
          id="categoryId"
          defaultValue={parentCategory}
          required
        >
          <option value={""}>None</option>
          {allCategories.map((category) => {
            return (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            );
          })}
        </Select>
      </div>

      {/* MANUFACTURER */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label htmlFor="manufacturerId" value="Manufacturer" />
        </div>
        <Select
          onChange={handleInputChange}
          id="manufacturerId"
          name="manufacturerId"
          defaultValue={activeProduct.manufacturerId}
        >
          <option value={""}>None</option>
          {allManufactures.map((manufacture) => {
            return (
              <option key={manufacture.id} value={manufacture.id}>
                {manufacture.name}
              </option>
            );
          })}
        </Select>
      </div>

      {/* DESCRIPTION */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label
            className="text-base"
            htmlFor="description"
            value="Description"
          />
        </div>
        <Textarea
          onChange={handleInputChange}
          id="description"
          name="description"
          placeholder="Product description..."
          rows={6}
          defaultValue={activeProduct.description}
        />
      </div>

      {/* DETAILS */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="details" value="Details" />
        </div>
        <Textarea
          onChange={handleInputChange}
          id="details"
          name="details"
          placeholder="Product details..."
          rows={6}
          defaultValue={activeProduct.details}
        />
      </div>

      {/* IS PUBLISHED */}
      <ToggleSwitch
        checked={isPublished}
        label="Published"
        onChange={changeIsPublished}
      />

      {/* IS PUBLISHED */}
      <ToggleSwitch
        checked={isMostSold}
        label="Most sold"
        onChange={changeIsMostSold}
      />

      {/* IS RECOMMENDED */}
      <ToggleSwitch
        checked={isRecommended}
        label="Recommended"
        onChange={changeIsRecommended}
      />

      <Button className="mt-4" type="submit">
        Save changes
      </Button>
    </form>
  );
};

export default GeneralInfo;
