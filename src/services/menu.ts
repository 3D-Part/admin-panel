import { API } from '@/shared/helpers'
import { MenuItemNode } from '@/store/slices/menuBuilderSlice'

const API_BASE_URL = process.env.API_KEY

export interface MenuData {
  menu: {
    items: MenuItemNode[]
  }
}

const saveMenu = async (menuData: MenuData): Promise<boolean> => {
  try {
    await API.put(`${API_BASE_URL}/shop/menu`, menuData)
    return true
  } catch (error) {
    console.error('Error saving menu:', error)
    return false
  }
}

const getMenu = async (): Promise<MenuItemNode[] | null> => {
  try {
    const data = await API.get<MenuData>(`${API_BASE_URL}/shop/menu`)
    return data?.menu?.items || []
  } catch (error) {
    console.error('Error fetching menu:', error)
    return null
  }
}

const MenuAPI = {
  saveMenu,
  getMenu,
}

export default MenuAPI
