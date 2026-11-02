import { API } from '@/shared/helpers'

const API_BASE_URL = process.env.API_KEY
const BASE = `${API_BASE_URL}/backoffice`

export type DisputedFlag =
  | 'NO_PICKUP'
  | 'LATE_PAY'
  | 'COMPLAINTS'
  | 'ABUSIVE'
  | 'OTHER'
export type CustomerFlag = DisputedFlag | 'BLUE' | 'GREEN'
export type CustomerProfile = { flag: CustomerFlag | null; note: string | null }

export type AnalyticsRow = {
  id: string
  name: string
  sku?: string
  quantity: number
  revenue: number
  cost: number
  shipping: number
  profit: number | null
  hasCost: boolean
}

export type Analytics = {
  totals: {
    orders: number
    itemsSold: number
    revenue: number
    shippingCharged: number
    shippingCost: number
    goodsCost: number
    missingCostItems: number
    profit: number
  }
  days: { date: string; orders: number; revenue: number }[]
  topProducts: AnalyticsRow[]
  filaments: {
    rows: AnalyticsRow[]
    quantity: number
    revenue: number
    cost: number
    profit: number
    missingCost: number
  }
}

export type ActionNeeded = {
  type: 'MISSING_PURCHASE_PRICE' | 'SOLD_BELOW_COST'
  productId: string
  code: string
  name: string
  sku: string
  price: number
  purchasePrice: number | null
  soldQuantity: number
  reason: string
  note: string | null
}

export type StockAlert = {
  id: string
  code: string
  name: string
  sku: string
  quantity: number
  lowStockWarning: number | null
  lowStockCritical: number | null
  note: string | null
  level: 'warning' | 'critical'
}

export type ProformaItem = {
  productId?: string
  name: string
  sku?: string
  quantity: number
  price: number
  total?: number
}

export type Proforma = {
  id: string
  number: string
  orderId: string | null
  customer: Record<string, string>
  items: ProformaItem[]
  price: string
  discount: string
  shippingPrice: string
  total: string
  note: string | null
  validUntil: string | null
  sentAt: string | null
  createdAt: string
}

export type ProformaBody = {
  orderId?: string | null
  customer: Record<string, string>
  items: ProformaItem[]
  discount?: number
  shippingPrice?: number
  note?: string | null
  validUntil?: string | null
}

export type EditOrderBody = {
  products: { productId: string; quantity: number; price?: number }[]
  discount?: number
  shippingPrice?: number
  [field: string]: unknown
}

// Errors are shown as a toast by the axios interceptor; callers only need to
// know whether it worked.
const attempt = async <T>(request: () => Promise<T>): Promise<T | null> => {
  try {
    return await request()
  } catch (error) {
    console.error('Backoffice request failed:', error)
    return null
  }
}

const BackofficeAPI = {
  getAnalytics: (from: string, to: string) =>
    attempt(() => API.get<Analytics>(`${BASE}/analytics`, { from, to })),
  getActionsNeeded: () =>
    attempt(() => API.get<ActionNeeded[]>(`${BASE}/actions-needed`)),
  getStockAlerts: () =>
    attempt(() => API.get<StockAlert[]>(`${BASE}/stock-alerts`)),
  getProductCosts: (ids: string[]) =>
    attempt(() =>
      API.get<Record<string, number>>(`${BASE}/product-costs`, {
        ids: ids.join(','),
      })
    ),
  setProductCost: (id: string, purchasePrice: number | null) =>
    attempt(() =>
      API.put<unknown, unknown>(`${BASE}/products/${id}/cost`, { purchasePrice })
    ),
  setProductNote: (id: string, note: string) =>
    attempt(() =>
      API.put<unknown, unknown>(`${BASE}/products/${id}/note`, { note })
    ),
  getProductCategories: (id: string) =>
    attempt(() => API.get<string[]>(`${BASE}/products/${id}/categories`)),
  setProductCategories: (id: string, categoryIds: string[]) =>
    attempt(() =>
      API.put<unknown, string[]>(`${BASE}/products/${id}/categories`, {
        categoryIds,
      })
    ),
  setManufacturerSort: (id: string, sortPriority: number | null) =>
    attempt(() =>
      API.patch<unknown, unknown>(`${BASE}/manufacturers/${id}/sort`, {
        sortPriority,
      })
    ),
  getPackingList: (orderId: string) =>
    attempt(() => API.get<any[]>(`${BASE}/orders/${orderId}/packing`)),
  editOrder: (orderId: string, body: EditOrderBody) =>
    attempt(() => API.put<EditOrderBody, any>(`${BASE}/orders/${orderId}`, body)),
  getCustomerProfiles: (emails: string[]) =>
    attempt(() =>
      API.get<Record<string, CustomerProfile>>(`${BASE}/customers`, {
        emails: emails.join(','),
      })
    ),
  getDisputedCustomers: () =>
    attempt(() => API.get<string[]>(`${BASE}/customers/disputed`)),
  saveCustomerProfile: (body: {
    email: string
    flag: CustomerFlag | null
    note: string | null
  }) => attempt(() => API.put<unknown, unknown>(`${BASE}/customers`, body)),
  getProformas: (limit: number, offset: number, search: string) =>
    attempt(() =>
      API.get<{ count: number; rows: Proforma[] }>(`${BASE}/proformas`, {
        limit,
        offset,
        ...(search ? { search } : {}),
      })
    ),
  createProforma: (body: ProformaBody) =>
    attempt(() => API.post<ProformaBody, Proforma>(`${BASE}/proformas`, body)),
  createProformaFromOrder: (orderId: string) =>
    attempt(() =>
      API.post<unknown, Proforma>(`${BASE}/proformas/from-order/${orderId}`, {})
    ),
  updateProforma: (id: string, body: ProformaBody) =>
    attempt(() => API.put<ProformaBody, Proforma>(`${BASE}/proformas/${id}`, body)),
  sendProforma: (id: string) =>
    attempt(() => API.post<unknown, Proforma>(`${BASE}/proformas/${id}/send`, {})),
  deleteProforma: (id: string) =>
    attempt(() => API.remove<unknown>(`${BASE}/proformas/${id}`)),
}

export default BackofficeAPI
