import { API } from '@/shared/helpers'
import { PaginationData, SortParamsData, UsersData } from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getUsers = async (
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
    const data = await API.get<UsersData>(
      `${API_BASE_URL}/users/?${queryParams}`,
      params
    )
    return data
  } catch (error) {
    console.error('Error fetching users data:', error)
    return null
  }
}

const UsersAPI = {
  getUsers,
  // addNewManufacturer,
  // editManufacturer,
  // removeManufacture,
}

export default UsersAPI
