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
import { ProductsAPI } from '@/services'
import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { ProductFormBody } from '@/shared/types'
import { toast } from 'react-toastify'
import TextEditor from '@/components/common/TextEditor'

const GeneralInfo = () => {
  const [isPublished, setIsPublished] = useState(true)
  const [isMostSold, setIsMostSold] = useState(false)
  const [isRecommended, setIsRecommended] = useState(false)
  const [isShoppingCartRecommended, setIsShoppingCartRecommended] =
    useState(false)
  const [loader, setLoader] = useState(true)
  const [keywords, setKeywords] = useState<string[]>([])

  // const [parentCategory, setParentCategoryId] = useState('')

  // STORE DATA
  const { editProduct, activeProduct } = useProductsStore()
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

  // const resetData = () => {
  //   formRef.current && formRef.current.reset()
  //   productDataRef.current = {} as ProductFormBody
  //   setIsPublished(true)
  //   setIsMostSold(false)
  //   setIsRecommended(false)
  //   setIsShoppingCartRecommended(false)
  // }




  // saved right away, like on the product groups page, so it does not wait
  // for the form and cannot overwrite other changes
  const [savingPublished, setSavingPublished] = useState(false)
  const togglePublished = async () => {
    const next = !isPublished
    setSavingPublished(true)
    const ok = await ProductsAPI.setProductGroup('published', [activeProduct.id], next)
    setSavingPublished(false)
    if (!ok) {
      toast(tx('The group was not saved'), { type: 'error', autoClose: 3000 })
      return
    }
    setIsPublished(next)
    toast(next ? tx('Published on the site') : tx('Hidden from the site'), {
      type: 'success',
      autoClose: 2000,
    })
  }

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!productDataRef.current.name) return

    // the groups (published, super offer...) are set on the product groups
    // page, so saving this form never overwrites them
    const {
      isPublished: _published,
      isMostSold: _mostSold,
      isRecommended: _recommended,
      isShoppingCartRecommended: _cartRecommended,
      ...payload
    } = productDataRef.current as any
    const request = await editProduct(activeProduct.id, payload)

    if (request) {
      toast(`${productDataRef.current.name} is changed!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })

      // resetData()
    }
  }

  // GET MANUFACTURES
  const getAllManufactures = useCallback(async () => {
    setLoader(true)
    const data = await fetchAllManufactures()
    setLoader(false)
    // if (data) {
    //   setLoader(false);
    // } else {
    //   setLoader(true);
    // }
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
    setLoader(false)
    // if (data) {
    //   setLoader(false);
    // } else {
    //   setLoader(true);
    // }
  }, [fetchAllCategories])

  useEffect(() => {
    const _activeProductFormData: ProductFormBody = {
      name: activeProduct.name,
      isPublished: activeProduct.isPublished,
      isMostSold: activeProduct.isMostSold,
      isRecommended: activeProduct.isRecommended,
      isShoppingCartRecommended: activeProduct.isShoppingCartRecommended,
      sku: activeProduct.sku,
      categoryId: activeProduct.categoryId,
      price: activeProduct.price,
      weight: activeProduct.weight,
      quantity: activeProduct.quantity,
    }

    if (activeProduct.description) {
      _activeProductFormData.description = activeProduct.description
    }
    if (activeProduct.details) {
      _activeProductFormData.details = activeProduct.details
    }
    if (activeProduct.manufacturerId) {
      _activeProductFormData.manufacturerId = activeProduct.manufacturerId
    }
    if (activeProduct.keywords) {
      _activeProductFormData.keywords = activeProduct.keywords
    }

    productDataRef.current = _activeProductFormData
  }, [activeProduct])

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

  useEffect(() => {
    setIsPublished(activeProduct.isPublished)
    setIsMostSold(activeProduct.isMostSold)
    setIsRecommended(activeProduct.isRecommended)
    setIsShoppingCartRecommended(activeProduct.isShoppingCartRecommended)
    setKeywords(activeProduct.keywords || [])
    // if (activeProduct.category) {
    //   setParentCategoryId(activeProduct.category.id)
    // }
  }, [activeProduct])

  if (loader || !activeProduct || allCategories.length === 0) return <Loader />

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
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
          defaultValue={activeProduct.name}
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
          defaultValue={activeProduct.sku}
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
          defaultValue={activeProduct.price}
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
          defaultValue={activeProduct.quantity}
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
          step="0.01"
          min="0"
          placeholder="0.00"
          defaultValue={activeProduct.weight}
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
          defaultValue={activeProduct.categoryId}
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
          defaultValue={activeProduct.manufacturerId}
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
        <Textarea
          onChange={handleInputChange}
          id="description"
          name="description"
          placeholder={tx("Product description...")}
          rows={6}
          defaultValue={activeProduct.description}
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
          defaultValue={activeProduct.details}
        />
      </div>
      {/* KEYWORDS */}
      <Keywords
        keywords={keywords}
        onChange={handleKeywordsChange}
        label={tx("Search Keywords")}
        placeholder={tx("Add search keyword...")}
      />
      <ToggleSwitch
        checked={isPublished}
        disabled={savingPublished}
        label={tx("Published")}
        onChange={togglePublished}
      />

      {/* PRODUCT GROUPS: managed on their own page, like a sale */}
      <div className="w-full rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">{tx("Product groups")}</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'published', label: 'Published', on: isPublished },
            { id: 'super-offer', label: 'Super offer', on: isRecommended },
            { id: 'most-sold', label: 'Most sold', on: isMostSold },
            { id: 'cart-recommended', label: 'Shopping cart recommended', on: isShoppingCartRecommended },
          ].map((group) => (
            <a
              key={group.id}
              href={`/products/groups?group=${group.id}`}
              className={`rounded-full px-3 py-1 text-xs font-medium hover:underline ${
                group.on
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-500 line-through dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {tx(group.label)}
            </a>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {tx("A product is put into a group or taken out on the Product groups page.")}
        </p>
      </div>
      <Button className="mt-6" type="submit" color="purple">
        {tx("Save changes")}
      </Button>
    </form>
  )
}

export default GeneralInfo
