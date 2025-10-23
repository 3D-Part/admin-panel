import { API } from '@/shared/helpers'

const API_BASE_URL = process.env.API_KEY

export interface ShopSettings {
  id: string
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsBody {
  settings: Record<string, unknown>
}

const getShopSettings = async (): Promise<ShopSettings | null> => {
  try {
    const data = await API.get<ShopSettings>(`${API_BASE_URL}/shop/settings`)
    return data
  } catch (error) {
    console.error('Error fetching shop settings:', error)
    return null
  }
}

const updateShopSettings = async (
  body: UpdateSettingsBody
): Promise<boolean> => {
  try {
    await API.put(`${API_BASE_URL}/shop/settings`, body)
    return true
  } catch (error) {
    console.error('Error updating shop settings:', error)
    return false
  }
}

const SettingsAPI = {
  getShopSettings,
  updateShopSettings,
}

export default SettingsAPI
