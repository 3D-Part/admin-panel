export type MovementType =
  | 'IN'
  | 'OUT'
  | 'RETURN'
  | 'INVENTORY'
  | 'ORDER'
  | 'ADJUSTMENT'
  | 'CREATED'
  | 'STATUS'

export type ProductMovementType = 'IN' | 'OUT' | 'RETURN' | 'INVENTORY'

export type AssetStatus =
  | 'IN_USE'
  | 'IN_STORAGE'
  | 'ON_LOAN'
  | 'IN_SERVICE'
  | 'BROKEN'
  | 'WRITTEN_OFF'

export interface WarehouseProduct {
  id: string
  name: string
  code: string
  sku: string
  ean: string | null
  price: string | number
  quantity: number
  lowStockWarning: number | null
  lowStockCritical: number | null
  isPublished: boolean
  images?: { imageId: string }[]
}

export interface Asset {
  id: string
  code: string
  name: string
  category: string | null
  status: AssetStatus
  location: string | null
  assignedTo: string | null
  serialNumber: string | null
  purchaseDate: string | null
  purchasePrice: string | number | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export type AssetFormBody = {
  name?: string
  category?: string | null
  status?: AssetStatus
  location?: string | null
  assignedTo?: string | null
  serialNumber?: string | null
  purchaseDate?: string | null
  purchasePrice?: number | null
  note?: string | null
}

export interface StockMovement {
  id: string
  type: MovementType
  quantityChange: number | null
  quantityAfter: number | null
  statusBefore: AssetStatus | null
  statusAfter: AssetStatus | null
  note: string | null
  orderId: string | null
  createdAt: string
  product?: { id: string; name: string; code: string; sku: string } | null
  asset?: { id: string; name: string; code: string } | null
  user?: { id: string; fullName: string | null; email: string } | null
}

export interface ScanResult {
  code: string
  products: WarehouseProduct[]
  assets: Asset[]
}

export interface ListResponse<T> {
  count: number
  rows: T[]
}

// One entry of the label print list
export interface LabelItem {
  key: string
  code: string
  name: string
  price?: string | number
  copies: number
}
