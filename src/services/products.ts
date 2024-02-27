import { API } from '@/shared/helpers'
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

const ProductsAPI = {
  getProducts,
  getOneProduct,
  addNewProduct,
  editProducts,
  removeProducts,
  addProductImage,
  editProductImage,
  removeProductImage,
}

export default ProductsAPI
