import { API } from '@/shared/helpers'
import { PaginationData, SortParamsData, PromoCodesData } from '@/shared/types'

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

// const addNewManufacturer = async (
//   body: ManufacturerFormBody
// ): Promise<ManufacturerData | null> => {
//   try {
//     const data: ManufacturerData = await API.post(
//       `${API_BASE_URL}/shop/manufactures/`,
//       body
//     );
//     return data;
//   } catch (error) {
//     console.error("Error adding manufacturer:", error);
//     return null;
//   }
// };

// const editManufacturer = async (
//   id: string,
//   body: ManufacturerFormBody
// ): Promise<ManufacturerData | null> => {
//   try {
//     const data: ManufacturerData = await API.patch(
//       `${API_BASE_URL}/shop/manufactures/${id}`,
//       body
//     );
//     return data;
//   } catch (error) {
//     console.error("Error editing manufacturer:", error);
//     return null;
//   }
// };

// const removeManufacture = async (id: string): Promise<boolean> => {
//   try {
//     await API.remove(`${API_BASE_URL}/shop/manufactures/${id}`);
//     return true;
//   } catch (error) {
//     console.error("Error removing manufactures:", error);
//     return false;
//   }
// };

const PromoCodesAPI = {
  getPromoCodes,
  // addNewManufacturer,
  // editManufacturer,
  // removeManufacture,
}

export default PromoCodesAPI
