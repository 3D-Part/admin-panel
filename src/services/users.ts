import { API } from '@/shared/helpers'
import {
  PaginationData,
  SortParamsData,
  UsersData,
  CreateEmployeeData,
  EditEmployeeData,
} from '@/shared/types'

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

const createEmployee = async (
  employeeData: CreateEmployeeData
): Promise<boolean> => {
  try {
    await API.post(`${API_BASE_URL}/users/employee`, employeeData)
    return true
  } catch (error) {
    console.error('Error creating employee:', error)
    return false
  }
}

const editEmployee = async (
  id: string,
  employeeData: EditEmployeeData
): Promise<boolean> => {
  try {
    await API.put(`${API_BASE_URL}/users/employee/${id}`, employeeData)
    return true
  } catch (error) {
    console.error('Error editing employee:', error)
    return false
  }
}

const UsersAPI = {
  getUsers,
  createEmployee,
  editEmployee,
  // addNewManufacturer,
  // editManufacturer,
  // removeManufacture,
}

export default UsersAPI
