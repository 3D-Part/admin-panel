import { API } from '@/shared/helpers'
import {
  CreateProductAttributeBody,
  EditProductAttributeBody,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

// const getProductAttributes = async (paginationData?: PaginationData) => {
//   const { offset, limit } = paginationData || {};

//   const queryParams = new URLSearchParams();

//   if (offset !== undefined && limit !== undefined) {
//     queryParams.append("offset", offset.toString());
//     queryParams.append("limit", limit.toString());
//   }

//   try {
//     const data = await API.get<AttributesData>(
//       `${API_BASE_URL}/shop/attributes/?${queryParams}`
//     );
//     return data;
//   } catch (error) {
//     console.error("Error fetching attributes data:", error);
//     return null;
//   }
// };

const addProductAttribute = async (
  body: CreateProductAttributeBody
): Promise<boolean> => {
  try {
    const data = await API.post(`${API_BASE_URL}/shop/product-attributes`, body)

    return true
  } catch (error) {
    console.error('Error adding product attribute:', error)
    return false
  }
}

const editProductAttribute = async (
  id: string,
  body: EditProductAttributeBody
): Promise<boolean> => {
  try {
    const data = await API.patch(
      `${API_BASE_URL}/shop/product-attributes/${id}`,
      body
    )
    return true
  } catch (error) {
    console.error('Error editing attribute:', error)
    return false
  }
}

const removeProductAttribute = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/shop/product-attributes/${id}`)
    return true
  } catch (error) {
    console.error('Error removing attributes:', error)
    return false
  }
}

const ProductAttributeAPI = {
  // getProductAttributes,
  addProductAttribute,
  editProductAttribute,
  removeProductAttribute,
}

export default ProductAttributeAPI
