import {
  AssetStatus,
  MovementType,
  WarehouseProduct,
} from '@/shared/types/warehouse'

// Stored values stay in English (like order statuses); the screen speaks
// Bosnian because the warehouse is used by the staff.

export const assetStatusLabels: Record<AssetStatus, string> = {
  IN_USE: 'U upotrebi',
  IN_STORAGE: 'U magacinu',
  ON_LOAN: 'Zaduženo / na terenu',
  IN_SERVICE: 'Na servisu',
  BROKEN: 'Neispravno',
  WRITTEN_OFF: 'Otpisano',
}

export const assetStatusOrder: AssetStatus[] = [
  'IN_USE',
  'IN_STORAGE',
  'ON_LOAN',
  'IN_SERVICE',
  'BROKEN',
  'WRITTEN_OFF',
]

// flowbite Badge colors
export const assetStatusColor: Record<AssetStatus, string> = {
  IN_USE: 'success',
  IN_STORAGE: 'info',
  ON_LOAN: 'purple',
  IN_SERVICE: 'warning',
  BROKEN: 'failure',
  WRITTEN_OFF: 'gray',
}

export const movementLabels: Record<MovementType, string> = {
  IN: 'Ulaz',
  OUT: 'Izlaz',
  RETURN: 'Povrat',
  INVENTORY: 'Inventura',
  ORDER: 'Narudžba',
  ADJUSTMENT: 'Izmjena u adminu',
  CREATED: 'Uneseno',
  STATUS: 'Promjena statusa',
}

export const movementColor: Record<MovementType, string> = {
  IN: 'success',
  OUT: 'failure',
  RETURN: 'info',
  INVENTORY: 'purple',
  ORDER: 'warning',
  ADJUSTMENT: 'gray',
  CREATED: 'success',
  STATUS: 'indigo',
}

export type StockLevel = 'ok' | 'warning' | 'critical'

/**
 * Same thresholds the admin enters per product: red at or below the critical
 * level, yellow at or below the warning level. Without thresholds only an
 * empty stock is red.
 */
export const getStockLevel = (product: WarehouseProduct): StockLevel => {
  const quantity = product.quantity ?? 0
  if (product.lowStockCritical != null && quantity <= product.lowStockCritical)
    return 'critical'
  if (product.lowStockWarning != null && quantity <= product.lowStockWarning)
    return 'warning'
  if (quantity <= 0) return 'critical'
  return 'ok'
}

export const stockLevelClasses: Record<StockLevel, string> = {
  ok: 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800',
  warning:
    'text-yellow-800 bg-yellow-50 border-yellow-300 dark:text-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
  critical:
    'text-red-700 bg-red-50 border-red-300 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800',
}

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('bs-BA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
