'use client'
import { tx } from '@/shared/i18n'
import { Loader, Keywords } from '@/components/common'
import {
  useManufactureStore,
  useCategoryStore,
  useProductsStore,
} from '@/store/store'
import {
  Button,
  Label,
  Select,
  TextInput,
  Textarea,
  ToggleSwitch,
} from 'flowbite-react'
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ProductFormBody } from '@/shared/types'
import { toast } from 'react-toastify'
import { URLPartsEnum } from '@/shared/enums'
import { useRouter } from 'next/navigation'
import TextEditor from '@/components/common/TextEditor'
import { useSingleFlight } from '@/shared/hooks/useEnterSave'

const GeneralInfo = () => {
  const [isPublished, setIsPublished] = useState(true)
  const [isMostSold, setIsMostSold] = useState(false)
  const [isRecommended, setIsRecommended] = useState(false)
  const [isShoppingCartRecommended, setIsShoppingCartRecommended] =
    useState(false)
  const [loader, setLoader] = useState(true)
  const [keywords, setKeywords] = useState<string[]>([])

  const router = useRouter()

  // STORE DATA
  const { addNewProducts } = useProductsStore()
  const { fetchAllManufactures, allManufactures } = useManufactureStore()
  const { fetchAllCategories, allCategories } = useCategoryStore()

  const productDataRef = useRef<ProductFormBody>({} as ProductFormBody)
  const formRef = useRef<HTMLFormElement>(null)

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target

    productDataRef.current = {
      ...productDataRef.current,
      [name]: value,
    }
  }

  // const handleDescriptionChange = (text: string) => {
  //   productDataRef.current.description = text;
  // };

  const handleDetailsChange = (text: string) => {
    productDataRef.current.details = text
  }

  const handleKeywordsChange = (newKeywords: string[]) => {
    setKeywords(newKeywords)
    productDataRef.current.keywords = newKeywords
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    productDataRef.current = {} as ProductFormBody
    setIsPublished(true)
    setIsMostSold(false)
    setIsRecommended(false)
    setIsShoppingCartRecommended(false)
    setKeywords([])
  }

  const changeIsPublished = () => {
    setIsPublished(!isPublished)
  }




  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!productDataRef.current.name) return

    productDataRef.current.isPublished = isPublished
    productDataRef.current.isMostSold = isMostSold
    productDataRef.current.isRecommended = isRecommended
    productDataRef.current.isShoppingCartRecommended = isShoppingCartRecommended

    const request = await addNewProducts(productDataRef.current)
    if (request) {
      toast(`${productDataRef.current.name} is created!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })

      resetData()
      router.push(URLPartsEnum.EditProduct)
    }
  }

  // Enter in a field submits the form; a second Enter or click while saving does nothing
  const onSubmitOnce = useSingleFlight(onSubmit)

  // GET MANUFACTURES
  const getAllManufactures = useCallback(async () => {
    setLoader(true)
    const data = await fetchAllManufactures()
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [fetchAllManufactures])

  // TODO need to be cached
  useEffect(() => {
    // if (allManufactures.length > 0) {
    //   setLoader(false);
    // } else {
    //   getAllManufactures();
    // }
    getAllManufactures()
  }, [])
  // }, [allManufactures, getAllManufactures]);

  // GET CATEGORIES
  const getAllCategories = useCallback(async () => {
    setLoader(true)
    const data = await fetchAllCategories()
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [fetchAllCategories])

  // TODO need to be cached
  useEffect(() => {
    // if (allCategories.length > 0) {
    //   setLoader(false);
    // } else {
    //   getAllCategories();
    // }
    getAllCategories()
  }, [])
  // }, [allCategories, getAllCategories]);

  if (loader) return <Loader />

  return (
    <form
      ref={formRef}
      onSubmit={onSubmitOnce}
      className="flex items-start max-w-2xl flex-col gap-6 pb-8"
    >
      {/* NAME */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="name" value={tx("Product name")} />
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
          <Label className="text-base" htmlFor="sku" value={tx("SKU")} />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="sku"
          name="sku"
          required
          type="text"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your product number, for example 230012. The internal code (P000895)
          is created automatically and the barcode (EAN) is added in Warehouse.
        </p>
      </div>

      {/* PRICE */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="price" value={tx("Price")} />
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

      {/* QUANTITY */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="quantity" value={tx("Quantity")} />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="quantity"
          name="quantity"
          required
          type="number"
        />
      </div>

      {/* WEIGHT */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="weight" value={tx("Weight")} />
        </div>
        <TextInput
          onChange={handleInputChange}
          id="weight"
          name="weight"
          required
          type="number"
          defaultValue={1}
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      {/* CATEGORY */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="categoryId" value={tx("Category")} />
        </div>
        <Select
          onChange={handleInputChange}
          id="categoryId"
          name="categoryId"
          required
        >
          <option value={''}>{tx("None")}</option>
          {allCategories.map((category) => {
            return (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            )
          })}
        </Select>
      </div>

      {/* MANUFACTURER */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label htmlFor="manufacturerId" value={tx("Manufacturer")} />
        </div>
        <Select
          onChange={handleInputChange}
          id="manufacturerId"
          name="manufacturerId"
        >
          <option value={''}>{tx("None")}</option>
          {allManufactures.map((manufacture) => {
            return (
              <option key={manufacture.id} value={manufacture.id}>
                {manufacture.name}
              </option>
            )
          })}
        </Select>
      </div>

      {/* DESCRIPTION */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label
            className="text-base"
            htmlFor="description"
            value={tx("Description")}
          />
        </div>
        {/* <TextEditor
          handleEditorChange={handleDescriptionChange}
          placeholder={tx("Product description...")}
          id="description"
        /> */}

        <Textarea
          onChange={handleInputChange}
          id="description"
          name="description"
          placeholder={tx("Product description...")}
          rows={4}
        />
      </div>

      {/* DETAILS */}
      <div className="w-full">
        <div className="mb-2 block">
          <Label className="text-base" htmlFor="details" value={tx("Details")} />
        </div>
        <TextEditor
          handleEditorChange={handleDetailsChange}
          placeholder={tx("Product details...")}
          id="details"
        />
      </div>

      {/* KEYWORDS */}
      <Keywords
        keywords={keywords}
        onChange={handleKeywordsChange}
        label={tx("Search Keywords")}
        placeholder={tx("Add search keyword...")}
      />

      {/* TOGGLE SWITCHES */}
      <div className="w-full space-y-4">
        {/* IS PUBLISHED */}
        <ToggleSwitch
          checked={isPublished}
          label={tx("Published")}
          onChange={changeIsPublished}
        />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tx("Super offer, most sold and shopping cart recommended are set on the Product groups page.")}
        </p>
      </div>

      <Button className="mt-6" type="submit" color="purple">
        {tx("Save")}
      </Button>
    </form>
  )
}

export default GeneralInfo
