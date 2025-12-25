import { API } from '@/shared/helpers'
import { PaginationData, SortParamsData, UsersData } from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getEmployees = async (
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

  // Add filter for admin role
  const filters = {
    filters: { role: { like: 'employee' } },
  }

  try {
    const data = await API.get<UsersData>(
      `${API_BASE_URL}/users/?${queryParams}`,
      { ...params, ...filters }
    )
    return data
  } catch (error) {
    console.error('Error fetching employees data:', error)
    return null
  }
}

const deleteEmployee = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/users/employee/${id}`)
    return true
  } catch (error) {
    console.error('Error deleting employee:', error)
    return false
  }
}

const EmployeesAPI = {
  getEmployees,
  deleteEmployee,
}

export default EmployeesAPI
