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

const orderSetBillingStep = async (
  id: string,
  step: string,
  done: boolean,
  // reason for the customer when the step cancels the order
  message?: string
): Promise<{ billingSteps?: Record<string, string>; status?: string } | null> => {
  try {
    const data: any = await API.patch(
      `${API_BASE_URL}/order/${id}/billing-steps`,
      { step, done, ...(message ? { message } : {}) }
    )
    return data ?? {}
  } catch (error) {
    console.error('Error saving invoice step:', error)
    return null
  }
}

// e-mails the offer to the customer (offers only), with the proforma as edited
const orderSendOffer = async (
  id: string,
  document?: ProformaDraft
): Promise<{ data: any | null; error: string | null }> => {
  try {
    return { data: await API.post(`${API_BASE_URL}/order/${id}/send-offer`, document ? { document } : {}), error: null }
  } catch (error: any) {
    console.error('Error sending the offer:', error)
    return { data: null, error: error?.response?.data?.errors?.[0]?.message ?? null }
  }
}

export type ProformaDraftLine = {
  code: string
  name: string
  unit: string
  quantity: number | string
  /** one piece with VAT, before the rabat */
  price: number | string
  /** rabat in percent */
  discount: number | string
}

export type ProformaDraft = {
  number: string
  date: string
  customer: { name: string; street: string; town: string; pib: string; jib: string }
  lines: ProformaDraftLine[]
}

type ProformaResult = { draft: ProformaDraft; saved: boolean }
type ProformaErrors = { errors: string[] }

const proformaErrors = (error: any): ProformaErrors => ({
  errors: (error?.response?.data?.errors ?? [])
    .map((item: { message?: string }) => item.message)
    .filter(Boolean),
})

// the proforma of an offer: the one saved last, or a fresh draft from the order
const getOfferDocument = async (id: string): Promise<ProformaResult | null> => {
  try {
    return await API.get(`${API_BASE_URL}/order/${id}/offer-document`)
  } catch (error) {
    console.error('Error loading the proforma:', error)
    return null
  }
}

const saveOfferDocument = async (id: string, document: ProformaDraft): Promise<ProformaResult | ProformaErrors> => {
  try {
    return await API.put(`${API_BASE_URL}/order/${id}/offer-document`, { document })
  } catch (error) {
    return proformaErrors(error)
  }
}

const resetOfferDocument = async (id: string): Promise<ProformaResult | null> => {
  try {
    await API.remove(`${API_BASE_URL}/order/${id}/offer-document`)
    return await getOfferDocument(id)
  } catch (error) {
    console.error('Error resetting the proforma:', error)
    return null
  }
}

// the proforma as the customer gets it; quiet, it runs while typing
const previewOfferDocument = async (document: ProformaDraft): Promise<{ html: string } | ProformaErrors> => {
  try {
    return await API.post(`${API_BASE_URL}/order/offer-document/preview`, { document })
  } catch (error) {
    return proformaErrors(error)
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

// the staff's flag on an order, or none
const orderSetFlag = async (id: string, flag: string | null): Promise<boolean> => {
  try {
    await API.patch(`${API_BASE_URL}/order/${id}/flag`, { flag })
    return true
  } catch (error) {
    console.error('Error saving the order flag:', error)
    return false
  }
}

// deletes the order for good; its stock and points go back first
const orderDelete = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/order/${id}`)
    return true
  } catch (error) {
    console.error('Error deleting order:', error)
    return false
  }
}

const OrdersAPI = {
  orderDelete,
  orderSetFlag,
  getOrders,
  orderAccept,
  orderDecline,
  orderShipping,
  orderFinish,
  orderSetStatus,
  orderUpdateNote,
  orderSetDisputed,
  orderSendOffer,
  getOfferDocument,
  saveOfferDocument,
  resetOfferDocument,
  previewOfferDocument,
  orderSetBilling,
  orderSetBillingStep,
  orderStatusHistory,
  orderContactMessage,
}

export default OrdersAPI
