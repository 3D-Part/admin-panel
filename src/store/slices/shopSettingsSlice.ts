import { StateCreator } from 'zustand'
import { SettingsAPI } from '@/services'
import { ShopSettings, UpdateSettingsBody } from '@/services/settings'

export interface ShopSettingsSliceInterface {
  shopSettings: ShopSettings | null
  isLoading: boolean
  getShopSettings: () => Promise<ShopSettings | null>
  updateShopSettings: (settings: UpdateSettingsBody) => Promise<boolean>
}

export const shopSettingsSlice: StateCreator<ShopSettingsSliceInterface> = (
  set
) => ({
  shopSettings: null,
  isLoading: false,

  getShopSettings: async () => {
    set({ isLoading: true })
    try {
      const data = await SettingsAPI.getShopSettings()
      set({ shopSettings: data, isLoading: false })
      return data
    } catch (error) {
      console.error('Error with getting shop settings:', error)
      set({ isLoading: false })
      return null
    }
  },

  updateShopSettings: async (settings: UpdateSettingsBody) => {
    set({ isLoading: true })
    try {
      const success = await SettingsAPI.updateShopSettings(settings)
      if (success) {
        // Optionally refetch the settings to get the updated data
        const data = await SettingsAPI.getShopSettings()
        set({ shopSettings: data, isLoading: false })
      } else {
        set({ isLoading: false })
      }
      return success
    } catch (error) {
      console.error('Error updating shop settings:', error)
      set({ isLoading: false })
      return false
    }
  },
})
