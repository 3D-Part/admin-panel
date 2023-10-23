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
import { URLPartsEnum } from "@/shared/enums";
import { useRouter } from "next/navigation";
import TextEditor from "@/components/common/TextEditor";

const GeneralInfo = () => {
  const [isPublished, setIsPublished] = useState(true);
  const [isMostSold, setIsMostSold] = useState(false);
  const [loader, setLoader] = useState(true);

  const router = useRouter();

  // STORE DATA
  const { addNewProducts } = useProductsStore();
  const { fetchAllManufactures, allManufactures } = useManufactureStore();
  const { fetchAllCategories, allCategories } = useCategoryStore();
  const [isRecommended, setIsRecommended] = useState(false);

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

  // const handleDescriptionChange = (text: string) => {
  //   productDataRef.current.description = text;
  // };

  const handleDetailsChange = (text: string) => {
    productDataRef.current.details = text;
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

    const request = await addNewProducts(productDataRef.current);
    if (request) {
      toast(`${productDataRef.current.name} is created!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });

      resetData();
      router.push(URLPartsEnum.EditProduct, { shallow: true });
    }
  };

  // GET MANUFACTURES
  const getAllManufactures = useCallback(async () => {
    setLoader(true);
    const data = await fetchAllManufactures();
    if (data) {
      setLoader(false);
    } else {
      setLoader(true);
    }
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
    if (data) {
      setLoader(false);
    } else {
      setLoader(true);
    }
  }, [fetchAllCategories]);

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

  if (loader) return <Loader />;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex items-start max-w-2xl flex-col gap-4"
    >
      {/* NAME */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="name" value="Product name" />
        </div>
        <TextInput
          name="name"
          onChange={handleInputChange}
          id="name"
          required
          type="text"
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
          type="number"
          defaultValue={0}
          required
        />
      </div>

      {/* CATEGORY */}
      <div className="w-full" id="select">
        <div className="mb-2 block">
          <Label htmlFor="category" value="Category" />
        </div>
        <Select
          onChange={handleInputChange}
          name="categoryId"
          id="category"
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
        {/* <TextEditor
          handleEditorChange={handleDescriptionChange}
          placeholder="Product description..."
          id="description"
        /> */}

        <Textarea
          onChange={handleInputChange}
          id="description"
          name="description"
          placeholder="Product description..."
          rows={4}
        />
      </div>

      {/* DETAILS */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="details" value="Details" />
        </div>
        <TextEditor
          handleEditorChange={handleDetailsChange}
          placeholder="Product details..."
          id="details"
        />
      </div>

      {/* IS PUBLISHED */}
      <ToggleSwitch
        checked={isPublished}
        label="Published"
        onChange={changeIsPublished}
      />

      {/* IS MOST SOLD */}
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
        Save
      </Button>
    </form>
  );
};

export default GeneralInfo;
