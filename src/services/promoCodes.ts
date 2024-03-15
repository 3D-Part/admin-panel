import { API } from '@/shared/helpers'
import {
  PaginationData,
  SortParamsData,
  PromoCodesData,
  PromoCodeFormBody,
  PromoCode,
  UsersToPromoCode,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getPromoCodes = async (
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
    const data = await API.get<PromoCodesData>(
      `${API_BASE_URL}/shop/promotion-codes/?${queryParams}`,
      params
    )
    return data
  } catch (error) {
    console.error('Error fetching promo codes data:', error)
    return null
  }
}

const addNewPromoCode = async (
  body: PromoCodeFormBody
): Promise<PromoCode | null> => {
  try {
    const data: PromoCode = await API.post(
      `${API_BASE_URL}/shop/promotion-codes/`,
      body
    )
    return data
  } catch (error) {
    console.error('Error adding promo code:', error)
    return null
  }
}

const editPromoCode = async (
  id: string,
  body: PromoCodeFormBody
): Promise<PromoCode | null> => {
  try {
    const data: PromoCode = await API.patch(
      `${API_BASE_URL}/shop/promotion-codes/${id}`,
      body
    )
    return data
  } catch (error) {
    console.error('Error editing promo code:', error)
    return null
  }
}

const removePromoCode = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/shop/promotion-codes/${id}`)
    return true
  } catch (error) {
    console.error('Error removing promo code:', error)
    return false
  }
}

const addUsersToPromoCode = async (
  body: UsersToPromoCode
): Promise<boolean> => {
  try {
    const data: PromoCode = await API.patch(
      `${API_BASE_URL}/shop/user-promotion-code/`,
      body
    )
    return true
  } catch (error) {
    console.error('Error adding users to promo code:', error)
    return false
  }
}

const PromoCodesAPI = {
  getPromoCodes,
  addNewPromoCode,
  editPromoCode,
  removePromoCode,
  addUsersToPromoCode,
}

export default PromoCodesAPI
