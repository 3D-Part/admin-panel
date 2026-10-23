import { API } from '@/shared/helpers'
import {
  Asset,
  AssetFormBody,
  ListResponse,
  ProductMovementType,
  ScanResult,
  StockMovement,
  WarehouseProduct,
} from '@/shared/types/warehouse'

const API_BASE_URL = process.env.API_KEY

// Errors are shown as a toast by the axios interceptor; callers only need to
// know whether it worked.

const scan = async (code: string): Promise<ScanResult | null> => {
  try {
    return await API.get<ScanResult>(
      `${API_BASE_URL}/warehouse/scan/${encodeURIComponent(code)}`
    )
  } catch (error) {
    console.error('Error scanning code:', error)
    return null
  }
}

const searchProducts = async (
  search: string,
  limit = 30
): Promise<WarehouseProduct[]> => {
  try {
    return await API.get<WarehouseProduct[]>(
      `${API_BASE_URL}/warehouse/products`,
      { search, limit }
    )
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

const moveProductStock = async (
  productId: string,
  body: { type: ProductMovementType; quantity: number; note?: string }
): Promise<{ product: WarehouseProduct; movement: StockMovement } | null> => {
  try {
    return await API.post(
      `${API_BASE_URL}/warehouse/products/${productId}/movements`,
      body
    )
  } catch (error) {
    console.error('Error moving stock:', error)
    return null
  }
}

const assignEan = async (
  productId: string,
  ean: string | null
): Promise<WarehouseProduct | null> => {
  try {
    return await API.patch(
      `${API_BASE_URL}/warehouse/products/${productId}/ean`,
      { ean }
    )
  } catch (error) {
    console.error('Error assigning barcode:', error)
    return null
  }
}

const getAssets = async (params: {
  search?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<ListResponse<Asset> | null> => {
  try {
    return await API.get<ListResponse<Asset>>(
      `${API_BASE_URL}/warehouse/assets`,
      params
    )
  } catch (error) {
    console.error('Error fetching assets:', error)
    return null
  }
}

const createAsset = async (body: AssetFormBody): Promise<Asset | null> => {
  try {
    return await API.post(`${API_BASE_URL}/warehouse/assets`, body)
  } catch (error) {
    console.error('Error creating asset:', error)
    return null
  }
}

const updateAsset = async (
  id: string,
  body: AssetFormBody
): Promise<Asset | null> => {
  try {
    return await API.put(`${API_BASE_URL}/warehouse/assets/${id}`, body)
  } catch (error) {
    console.error('Error updating asset:', error)
    return null
  }
}

const changeAssetStatus = async (
  id: string,
  body: {
    status: string
    location?: string | null
    assignedTo?: string | null
    note?: string
  }
): Promise<{ asset: Asset; movement: StockMovement } | null> => {
  try {
    return await API.patch(
      `${API_BASE_URL}/warehouse/assets/${id}/status`,
      body
    )
  } catch (error) {
    console.error('Error changing asset status:', error)
    return null
  }
}

const deleteAsset = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/warehouse/assets/${id}`)
    return true
  } catch (error) {
    console.error('Error deleting asset:', error)
    return false
  }
}

const getMovements = async (params: {
  productId?: string
  assetId?: string
  type?: string
  limit?: number
  offset?: number
}): Promise<ListResponse<StockMovement> | null> => {
  try {
    return await API.get<ListResponse<StockMovement>>(
      `${API_BASE_URL}/warehouse/movements`,
      params
    )
  } catch (error) {
    console.error('Error fetching movements:', error)
    return null
  }
}

const WarehouseAPI = {
  scan,
  searchProducts,
  moveProductStock,
  assignEan,
  getAssets,
  createAsset,
  updateAsset,
  changeAssetStatus,
  deleteAsset,
  getMovements,
}

export default WarehouseAPI
