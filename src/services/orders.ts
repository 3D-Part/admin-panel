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
    const data = await API.get<OrdersData>(
      `${API_BASE_URL}/order?${queryParams}`,
      params
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

const orderSetStatus = async (
  id: string,
  status: string
): Promise<any | null> => {
  try {
    const data: any = await API.patch(`${API_BASE_URL}/order/${id}/status`, {
      status,
    })
    return data
  } catch (error) {
    console.error('Error changing order status:', error)
    return null
  }
}

const orderUpdateNote = async (
  id: string,
  internalNote: string
): Promise<any | null> => {
  try {
    const data: any = await API.patch(`${API_BASE_URL}/order/${id}/note`, {
      internalNote,
    })
    return data
  } catch (error) {
    console.error('Error saving order note:', error)
    return null
  }
}

const orderSetBilling = async (
  id: string,
  billingStatus: string | null
): Promise<any | null> => {
  try {
    const data: any = await API.patch(`${API_BASE_URL}/order/${id}/billing`, {
      billingStatus,
    })
    return data
  } catch (error) {
    console.error('Error saving invoice status:', error)
    return null
  }
}

const orderSetDisputed = async (
  id: string,
  disputed: boolean
): Promise<any | null> => {
  try {
    const data: any = await API.patch(`${API_BASE_URL}/order/${id}/disputed`, {
      disputed,
    })
    return data
  } catch (error) {
    console.error('Error saving disputed order:', error)
    return null
  }
}

const orderStatusHistory = async (id: string): Promise<any | null> => {
  try {
    const data: any = await API.get(`${API_BASE_URL}/order/${id}/history`)
    return data
  } catch (error) {
    console.error('Error fetching order history:', error)
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
  orderSetStatus,
  orderUpdateNote,
  orderSetDisputed,
  orderSetBilling,
  orderStatusHistory,
  orderContactMessage,
}

export default OrdersAPI
