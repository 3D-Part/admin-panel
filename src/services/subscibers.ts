import { API } from '@/shared/helpers'
import {
  PaginationData,
  SortParamsData,
  SubscribersData,
  SubscribersEmailBody,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getSubscribers = async (
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
    const data = await API.get<SubscribersData>(
      `${API_BASE_URL}/shop/subscriber/?${queryParams}`,
      params
    )
    return data
  } catch (error) {
    console.error('Error fetching subscribers data:', error)
    return null
  }
}

const sendMailToAllSubscribers = async (
  body: SubscribersEmailBody
): Promise<any | null> => {
  try {
    const data: any = await API.post(
      `${API_BASE_URL}/shop/subscriber/send-newsletter`,
      body
    )
    return data
  } catch (error) {
    console.error('Error sending message to all subscribers:', error)
    return null
  }
}

const SubscribersAPI = {
  getSubscribers,
  sendMailToAllSubscribers,
}

export default SubscribersAPI
