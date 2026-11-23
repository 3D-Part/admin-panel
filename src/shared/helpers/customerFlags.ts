'use client'
import { useEffect } from 'react'
import { useShopSettingsStore } from '@/store/store'

/**
 * Customer statuses (flags) as the admin sets them up in the settings. Every
 * red status means disputed: those customers are listed as disputed and their
 * new orders are marked.
 */

export const CUSTOMER_FLAG_COLORS = {
  green: { label: 'Green', text: 'text-[#22c55e]', dot: 'bg-[#22c55e]' },
  orange: { label: 'Orange', text: 'text-[#f97316]', dot: 'bg-[#f97316]' },
  red: { label: 'Red', text: 'text-[#dc2626]', dot: 'bg-[#dc2626]' },
  yellow: { label: 'Yellow', text: 'text-[#eab308]', dot: 'bg-[#eab308]' },
  blue: { label: 'Blue', text: 'text-[#3b82f6]', dot: 'bg-[#3b82f6]' },
  purple: { label: 'Purple', text: 'text-[#a855f7]', dot: 'bg-[#a855f7]' },
  gray: { label: 'Gray', text: 'text-[#9ca3af]', dot: 'bg-[#9ca3af]' },
} as const

export type CustomerFlagColor = keyof typeof CUSTOMER_FLAG_COLORS

export type CustomerFlagType = { id: string; label: string; color: CustomerFlagColor }

// the same as the API's defaults, used until the settings are loaded
export const DEFAULT_CUSTOMER_FLAGS: CustomerFlagType[] = [
  { id: 'GREEN', label: 'Dobar kupac', color: 'green' },
  { id: 'ORANGE', label: 'Na granici', color: 'orange' },
  { id: 'NO_PICKUP', label: 'Nije preuzeo narudžbu', color: 'red' },
  { id: 'LATE_PAY', label: 'Kasni s plaćanjem ili ne plaća', color: 'red' },
  { id: 'COMPLAINTS', label: 'Previše reklamacija', color: 'red' },
  { id: 'ABUSIVE', label: 'Neprimjereno ponašanje', color: 'red' },
  { id: 'OTHER', label: 'Drugi razlog', color: 'red' },
]

// flags the staff put on an order; the same as the API's defaults
export const DEFAULT_ORDER_FLAGS: CustomerFlagType[] = [
  { id: 'HITNO', label: 'Hitno', color: 'red' },
  { id: 'CEKA_UPLATU', label: 'Čeka uplatu', color: 'orange' },
  { id: 'PROVJERITI', label: 'Provjeriti', color: 'yellow' },
  { id: 'SPREMNO', label: 'Spremno za slanje', color: 'green' },
]

// flags the staff put on products, e.g. "check the price"; none until added
export const DEFAULT_PRODUCT_FLAGS: CustomerFlagType[] = []

export const readProductFlags = (settings: any): CustomerFlagType[] =>
  Array.isArray(settings?.productFlags) ? settings.productFlags : DEFAULT_PRODUCT_FLAGS

export const readOrderFlags = (settings: any): CustomerFlagType[] =>
  Array.isArray(settings?.orderFlags) ? settings.orderFlags : DEFAULT_ORDER_FLAGS

export const readCustomerFlags = (settings: any): CustomerFlagType[] =>
  Array.isArray(settings?.customerFlags) ? settings.customerFlags : DEFAULT_CUSTOMER_FLAGS

// one request for every badge on the page
let loading: Promise<unknown> | null = null

/** Loads the settings once for every flag on the page, then reads them. */
const useSettingsOnce = () => {
  const shopSettings = useShopSettingsStore((state) => state.shopSettings)
  useEffect(() => {
    if (!shopSettings && !loading) {
      loading = useShopSettingsStore
        .getState()
        .getShopSettings()
        .finally(() => {
          loading = null
        })
    }
  }, [shopSettings])
  return (shopSettings as any)?.settings
}

/** The customer statuses of the settings. */
export const useCustomerFlagTypes = (): CustomerFlagType[] => readCustomerFlags(useSettingsOnce())

/** The product flags of the settings. */
export const useProductFlagTypes = (): CustomerFlagType[] => readProductFlags(useSettingsOnce())

/** The order flags of the settings. */
export const useOrderFlagTypes = (): CustomerFlagType[] => readOrderFlags(useSettingsOnce())

/** A new id from the name: upper case letters, digits and underscores. */
export const flagIdFromLabel = (label: string, taken: string[]) => {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'DJ')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 34) || 'STATUS'
  let id = base
  for (let n = 2; taken.includes(id); n++) id = `${base}_${n}`
  return id
}
