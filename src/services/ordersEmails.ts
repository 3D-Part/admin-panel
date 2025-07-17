import { API } from '@/shared/helpers'
import {
  PaginationData,
  SortParamsData,
  OrdersEmailsData,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getOrdersEmails = async (
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
  // queryParams.append('sort[order]', sortData.order)
  queryParams.append('sort[field]', sortData.field)

  try {
    const data = await API.get<OrdersEmailsData>(
      `${API_BASE_URL}/order/buyers/emails/?${queryParams}`,
      params
    )
    return data
  } catch (error) {
    console.error('Error fetching buyers emails data:', error)
    return null
  }
}

const OrderEmailsAPI = {
  getOrdersEmails,
}

export default OrderEmailsAPI
