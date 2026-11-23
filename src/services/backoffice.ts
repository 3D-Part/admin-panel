import { API } from '@/shared/helpers'

const API_BASE_URL = process.env.API_KEY
const BASE = `${API_BASE_URL}/backoffice`

export type TrafficProduct = { productId: string; name: string; sku: string; views: number; adds: number }
export type SiteTraffic = {
  totals: { pages: number; views: number; adds: number }
  // title: the product's name on a product page
  pages: { path: string; count: number; title: string | null }[]
  viewed: TrafficProduct[]
  added: TrafficProduct[]
}

export type ZohoStatus = {
  connected: boolean
  listKey?: string
  listName?: string
  error?: string
  lists: { listKey: string; listName: string; contacts: number }[]
  fromEmail?: string
  senders?: string[]
  verifiedSenders?: string[]
  testListKey?: string
  testListName?: string
}
export type ZohoSyncResult = {
  total: number
  inList: number
  added: number
  pending: number
  unsubscribed: number
  errors: number
}
export type ZohoSummary = {
  total: number
  inList: number
  pending: number
  unsubscribed: number
  errors: number
  notSynced: number
  zohoContacts: number | null
  contactLimit: number
  sentThisMonth: number
  monthlyLimit: number
}
export type ZohoCampaign = {
  id: string
  subject: string
  campaignKey: string | null
  status: 'draft' | 'created' | 'sending' | 'sent' | 'failed'
  error: string | null
  recipients: number | null
  isTest: boolean
  fromEmail: string | null
  createdAt: string
  sentAt: string | null
}

// the id of one of the customer statuses of the settings
export type CustomerFlag = string
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

// what we paid the couriers, typed in by hand
export type ShippingPaid = {
  id: string
  paidOn: string
  amount: number
  ordersCount: number
  note: string | null
}

// an order counted in the period, with the lines that match the filters
export type AnalyticsOrder = {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  name: string
  email: string
  quantity: number
  revenue: number
  shippingCharged: number
  total: number
}

export type Analytics = {
  totals: {
    orders: number
    itemsSold: number
    revenue: number
    shippingCharged: number
    // orders where the customer paid shipping
    shippingChargedOrders: number
    shippingCost: number
    // orders we paid shipping for (typed in, or all of them when estimated)
    shippingCostOrders: number
    // no entry in the period: the cost is the estimate from the settings
    shippingEstimated: boolean
    goodsCost: number
    missingCostItems: number
    profit: number
  }
  shippingPaid: ShippingPaid[]
  days: { date: string; orders: number; revenue: number }[]
  // every product sold in the period, best revenue first
  soldProducts: AnalyticsRow[]
  topProducts: AnalyticsRow[]
  byCategory: AnalyticsRow[]
  byManufacturer: AnalyticsRow[]
  // name is the company or the person, sku holds the email
  topCustomers: (AnalyticsRow & { orders: number })[]
  filaments: {
    rows: AnalyticsRow[]
    quantity: number
    revenue: number
    cost: number
    profit: number
    missingCost: number
  }
}

export type AnalyticsFilters = {
  from: string
  to: string
  categoryId?: string
  manufacturerId?: string
  customer?: string
}

export type CustomerTier = {
  tier: string | null
  manualTier: string | null
  spendTier: string | null
  spend: number
  period: 'all' | '12m'
  name: string | null
  discount: number
  color: string | null
  next: { name: string; discount: number; threshold: number; remaining: number } | null
}

export type ExportKind = 'orders' | 'products' | 'customers'

export type AssistantUsageRow = {
  provider: string
  model: string
  answers: number
  cachedAnswers: number
  calls: number
  inputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  outputTokens: number
  errors: number
  estimatedCostUsd: number | null
}

export type AssistantUsage = {
  rows: AssistantUsageRow[]
  prices: Record<string, { input: number; cacheRead: number; cacheWrite: number; output: number }>
}

export type ManualAction = {
  id: string
  title: string
  details: string | null
  done: boolean
  createdAt: string
  // a worker's task, or an entry of the "to order" list
  kind: 'task' | 'order'
  // set when the task is "order this product"
  productId: string | null
  product: {
    code: string
    name: string
    sku: string
    quantity: number
    note: string | null
  } | null
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

export type EditOrderBody = {
  products: { productId: string; quantity: number; price?: number }[]
  discount?: number
  shippingPrice?: number
  [field: string]: unknown
}

// Errors are shown as a toast by the axios interceptor; callers only need to
// know whether it worked.
export type AssistantHealth = {
  enabled: boolean
  provider: 'openai' | 'anthropic'
  hidden: boolean
  problem: 'credit' | 'key' | 'failing' | 'budget' | null
  message: string | null
  since: string | null
  spentTodayUsd?: number
  dailyBudgetUsd?: number
}

const attempt = async <T>(request: () => Promise<T>): Promise<T | null> => {
  try {
    return await request()
  } catch (error) {
    console.error('Backoffice request failed:', error)
    return null
  }
}

/** Like attempt, but keeps the API's message so the admin sees why it failed. */
const attemptWithError = async <T,>(
  request: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    return { data: await request(), error: null }
  } catch (error: any) {
    const message =
      error?.response?.data?.errors?.[0]?.message ?? error?.response?.data?.message ?? null
    return { data: null, error: message }
  }
}

const BackofficeAPI = {
  getAnalytics: (filters: AnalyticsFilters) =>
    attempt(() => API.get<Analytics>(`${BASE}/analytics`, filters)),
  addShippingPaid: (body: Omit<ShippingPaid, 'id'>) =>
    attempt(() => API.post<unknown, unknown>(`${BASE}/shipping-paid`, body)),
  deleteShippingPaid: (id: string) =>
    attempt(() => API.remove<unknown>(`${BASE}/shipping-paid/${id}`)),
  // the orders behind the analytics figures, a page at a time
  getAnalyticsOrders: (
    filters: AnalyticsFilters,
    page: { offset: number; limit: number; sort?: 'revenue'; shippingOnly?: boolean }
  ) =>
    attempt(() =>
      API.get<{ count: number; rows: AnalyticsOrder[] }>(`${BASE}/analytics/orders`, {
        ...filters,
        ...page,
      })
    ),
  getCustomerTier: (userId: string) =>
    attempt(() => API.get<CustomerTier>(`${BASE}/customers/${userId}/tier`)),
  // the file is built by the API, the browser only saves it
  downloadExport: async (kind: ExportKind, params: Record<string, string> = {}) => {
    const csv = await attempt(() => API.get<string>(`${BASE}/export/${kind}`, params))
    if (csv === null) return false
    // Excel needs the BOM to read č, ć, š and ž; keep it if axios dropped it
    const text = csv.startsWith('\uFEFF') ? csv : `\uFEFF${csv}`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    return true
  },
  getActionsNeeded: () =>
    attempt(() => API.get<ActionNeeded[]>(`${BASE}/actions-needed`)),
  // counters for the sidebar; `since` is when each section was last looked at
  getNews: (since: Record<string, string>) =>
    attempt(() =>
      API.get<Record<'orders' | 'offers' | 'users' | 'subscribers' | 'actions' | 'stock' | 'tasks', number>>(
        `${BASE}/news`,
        since
      )
    ),
  // most visited pages, most viewed and most added products of a period
  getTraffic: (from?: string, to?: string) =>
    attempt(() =>
      API.get<SiteTraffic>(`${BASE}/analytics/traffic`, {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      })
    ),
  // whether the chat assistant of the site works; if not, why
  getAssistantHealth: () => attempt(() => API.get<AssistantHealth>(`${BASE}/assistant-health`)),
  // what the chat assistant used, per provider and model, last 30 days by default
  getAssistantUsage: (from?: string, to?: string) =>
    attempt(() =>
      API.get<AssistantUsage>(`${BASE}/assistant-usage`, {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      })
    ),
  getManualActions: () =>
    attempt(() => API.get<ManualAction[]>(`${BASE}/manual-actions`)),
  saveManualAction: (
    body: {
      title: string
      details?: string
      done?: boolean
      productId?: string
      kind?: 'task' | 'order'
    },
    id?: string
  ) =>
    attempt(() =>
      id
        ? API.put<unknown, unknown>(`${BASE}/manual-actions/${id}`, body)
        : API.post<unknown, unknown>(`${BASE}/manual-actions`, body)
    ),
  deleteManualAction: (id: string) =>
    attempt(() => API.remove<unknown>(`${BASE}/manual-actions/${id}`)),
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
  // Zoho Campaigns: connect with the Self Client's code (secrets go to the API only)
  connectZoho: (body: { clientId: string; clientSecret: string; code: string }) =>
    attemptWithError(() => API.post<typeof body, ZohoStatus>(`${BASE}/zoho/connect`, body)),
  getZohoStatus: () => attemptWithError(() => API.get<ZohoStatus>(`${BASE}/zoho/status`)),
  getZohoCampaigns: () => attemptWithError(() => API.get<ZohoCampaign[]>(`${BASE}/zoho/campaigns`)),
  checkZoho: () =>
    attemptWithError(() =>
      API.get<{ ok: boolean; message: string; lists: ZohoStatus['lists'] }>(`${BASE}/zoho/check`)
    ),
  syncZoho: () => attemptWithError(() => API.post<unknown, ZohoSyncResult>(`${BASE}/zoho/sync`, {})),
  addZohoSubscriber: (email: string) =>
    attemptWithError(() =>
      API.post<{ email: string }, { email: string; zohoStatus: string | null }>(`${BASE}/zoho/subscribers`, { email })
    ),
  getZohoSummary: () => attemptWithError(() => API.get<ZohoSummary>(`${BASE}/zoho/summary`)),
  getZohoActiveCount: () => attemptWithError(() => API.get<{ count: number | null }>(`${BASE}/zoho/active-count`)),
  createZohoCampaign: (body: {
    subject: string
    html: string
    send: boolean
    fromEmail?: string
    test?: boolean
    testEmail?: string
    // only these subscribers get it
    emails?: string[]
  }) =>
    attemptWithError(() =>
      API.post<typeof body, { id: string; campaignKey: string; status: string }>(`${BASE}/zoho/campaigns`, body)
    ),
  sendZohoCampaign: (id: string) =>
    attemptWithError(() => API.post<unknown, { id: string; status: string }>(`${BASE}/zoho/campaigns/${id}/send`, {})),
  // the newsletter mailbox: log in and find the drafts folder
  testNewsletterMailbox: () =>
    attemptWithError(() =>
      API.post<unknown, { ok: true; user: string; draftsFolder: string }>(`${BASE}/newsletter/mailbox-test`, {})
    ),
  // the newsletter into the mailbox as drafts, one per group of recipients
  createNewsletterDrafts: (body: {
    subject: string
    html: string
    text?: string
    recipients: string[]
    perDraft: number
  }) =>
    attemptWithError(() =>
      API.post<typeof body, { drafts: number; recipients: number; draftsFolder: string }>(
        `${BASE}/newsletter/drafts`,
        body
      )
    ),
  getOrderFlagUsage: () =>
    attempt(() => API.get<Record<string, number>>(`${BASE}/order-flags/usage`)),
  getCustomerFlagUsage: () =>
    attempt(() => API.get<Record<string, number>>(`${BASE}/customer-flags/usage`)),
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
}

export default BackofficeAPI
