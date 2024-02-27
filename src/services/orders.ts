import { API } from '@/shared/helpers'
import {
  OrdersData,
  SortParamsData,
  PaginationData,
  OrderFormBody,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getOrders = async (
  sortData: SortParamsData,
  paginationData?: PaginationData
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
    const data = await API.get<OrdersData>(
      `${API_BASE_URL}/order?${queryParams}`
    )
    return data
  } catch (error) {
    console.error('Error fetching orders data:', error)
    return null
  }
}

const orderAccept = async (id: string): Promise<any | null> => {
  try {
    const data: any = await API.post(`${API_BASE_URL}/order/${id}/accept`)
    return data
  } catch (error) {
    console.error('Error accepting order:', error)
    return null
  }
}

const orderDecline = async (
  id: string,
  body: OrderFormBody
): Promise<any | null> => {
  try {
    const data: any = await API.post(
      `${API_BASE_URL}/order/${id}/decline`,
      body
    )
    return data
  } catch (error) {
    console.error('Error declining order:', error)
    return null
  }
}

const orderShipping = async (id: string): Promise<any | null> => {
  try {
    const data: any = await API.post(`${API_BASE_URL}/order/${id}/shipping`)
    return data
  } catch (error) {
    console.error('Error shipping order:', error)
    return null
  }
}

const orderFinish = async (id: string): Promise<any | null> => {
  try {
    const data: any = await API.post(`${API_BASE_URL}/order/${id}/finish`)
    return data
  } catch (error) {
    console.error('Error accepting order:', error)
    return null
  }
}

const orderContactMessage = async (
  id: string,
  body: OrderFormBody
): Promise<any | null> => {
  try {
    const data: any = await API.post(
      `${API_BASE_URL}/order/${id}/message/send`,
      body
    )
    return data
  } catch (error) {
    console.error('Error sending message:', error)
    return null
  }
}

const OrdersAPI = {
  getOrders,
  orderAccept,
  orderDecline,
  orderShipping,
  orderFinish,
  orderContactMessage,
}

export default OrdersAPI
