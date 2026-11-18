import { API } from '@/shared/helpers'
import { WarehouseProduct } from '@/shared/types/warehouse'
import {
  ProductsData,
  ProductFormBody,
  PaginationData,
  ProductData,
  ProductImagesFormBody,
  EditProductImageFormBody,
  SortParamsData,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getProducts = async (
  sortData: SortParamsData,
  paginationData?: PaginationData,
  params = {}
) => {
  const { offset, limit } = paginationData || {}

  const queryParams = new URLSearchParams()

  if (offset !== undefined && limit !== undefined) {
    queryParams.append('offset', offset.toString())
    queryParams.append('limit', limit.toString())
  }

  queryParams.append('sort[order]', sortData.order)
  queryParams.append('sort[field]', sortData.field)

  try {
    const data = await API.get<ProductsData>(
      `${API_BASE_URL}/shop/products/?${queryParams}`,
      params
    )
    return data
  } catch (error) {
    console.error('Error fetching products data:', error)
    return null
  }
}

const getOneProduct = async (id: string) => {
  try {
    const data = await API.get<ProductData>(
      `${API_BASE_URL}/shop/products/${id}`
    )
    return data
  } catch (error) {
    console.error('Error fetching products data:', error)
    return null
  }
}

const addNewProduct = async (
  body: ProductFormBody
): Promise<ProductData | null> => {
  try {
    const data: ProductData = await API.post(
      `${API_BASE_URL}/shop/products/`,
      body
    )
    return data
  } catch (error) {
    console.error('Error adding product:', error)
    return null
  }
}

const editProducts = async (
  id: string,
  body: ProductFormBody
): Promise<ProductData | null> => {
  try {
    const data: ProductData = await API.patch(
      `${API_BASE_URL}/shop/products/${id}`,
      body
    )
    return data
  } catch (error) {
    console.error('Error editing products:', error)
    return null
  }
}

const removeProducts = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/shop/products/${id}`)
    return true
  } catch (error) {
    console.error('Error removing product:', error)
    return false
  }
}

// IMAGES
const addProductImage = async (
  body: ProductImagesFormBody
): Promise<ProductData | null> => {
  try {
    const data: ProductData = await API.post(
      `${API_BASE_URL}/product-images`,
      body
    )
    return data
  } catch (error) {
    console.error('Error adding product image:', error)
    return null
  }
}

const editProductImage = async (
  id: string,
  body: EditProductImageFormBody
): Promise<ProductData | null> => {
  try {
    const data: ProductData = await API.patch(
      `${API_BASE_URL}/product-images/${id}`,
      body
    )
    return data
  } catch (error) {
    console.error('Error editing products:', error)
    return null
  }
}

const removeProductImage = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/product-images/${id}`)
    return true
  } catch (error) {
    console.error('Error removing product image:', error)
    return false
  }
}

/**
 * One page of the product search the admin pickers share: every word in any
 * order, best match first, letters with or without marks.
 */
const searchProducts = async (
  search: string,
  offset = 0,
  limit = 20,
  // only the products of a product group (member) or outside it
  group?: { id: ProductGroupId; member: boolean }
): Promise<{ rows: WarehouseProduct[]; count: number } | null> => {
  try {
    return await API.get<{ rows: WarehouseProduct[]; count: number }>(
      `${API_BASE_URL}/backoffice/products/search`,
      { search, offset, limit, ...(group ? { group: group.id, member: String(group.member) } : {}) }
    )
  } catch (error) {
    console.error('Error searching products:', error)
    return null
  }
}

export type ProductGroupId = 'published' | 'most-sold' | 'super-offer' | 'cart-recommended'

const getProductGroupCounts = async (): Promise<Record<ProductGroupId, number> | null> => {
  try {
    return await API.get<Record<ProductGroupId, number>>(`${API_BASE_URL}/backoffice/product-groups`)
  } catch (error) {
    console.error('Error loading product groups:', error)
    return null
  }
}

const setProductGroup = async (
  group: ProductGroupId,
  productIds: string[],
  member: boolean
): Promise<boolean> => {
  try {
    await API.put(`${API_BASE_URL}/backoffice/product-groups/${group}`, { productIds, member })
    return true
  } catch (error) {
    console.error('Error saving product group:', error)
    return false
  }
}

const ProductsAPI = {
  getProductGroupCounts,
  setProductGroup,
  getProducts,
  searchProducts,
  getOneProduct,
  addNewProduct,
  editProducts,
  removeProducts,
  addProductImage,
  editProductImage,
  removeProductImage,
}

export default ProductsAPI
