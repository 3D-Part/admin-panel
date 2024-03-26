import { API } from '@/shared/helpers'
import {
  PaginationData,
  SortParamsData,
  SalesData,
  Sale,
  SaleFormBody,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getSales = async (
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
    const data = await API.get<SalesData>(
      `${API_BASE_URL}/shop/sale/get-active-sale/?${queryParams}`,
      params
    )
    return data
  } catch (error) {
    console.error('Error fetching sales data:', error)
    return null
  }
}

const addNewSale = async (body: SaleFormBody): Promise<Sale | null> => {
  try {
    const data: Sale = await API.post(`${API_BASE_URL}/shop/sale/`, body)
    return data
  } catch (error) {
    console.error('Error adding sale:', error)
    return null
  }
}

const editSale = async (
  id: string,
  body: SaleFormBody
): Promise<Sale | null> => {
  try {
    const data: Sale = await API.patch(`${API_BASE_URL}/shop/sale/${id}`, body)
    return data
  } catch (error) {
    console.error('Error editing sale:', error)
    return null
  }
}

// const removePromoCode = async (id: string): Promise<boolean> => {
//   try {
//     await API.remove(`${API_BASE_URL}/shop/promotion-codes/${id}`)
//     return true
//   } catch (error) {
//     console.error('Error removing promo code:', error)
//     return false
//   }
// }

// const addUsersToPromoCode = async (
//   body: UsersToPromoCode
// ): Promise<boolean> => {
//   try {
//     const data: PromoCode = await API.patch(
//       `${API_BASE_URL}/shop/user-promotion-code/`,
//       body
//     )
//     return true
//   } catch (error) {
//     console.error('Error adding users to promo code:', error)
//     return false
//   }
// }

const SalesAPI = {
  getSales,
  addNewSale,
  editSale,
  // removePromoCode,
  // addUsersToPromoCode,
}

export default SalesAPI
