export type BillingOption = {
  id: string
  label: string
  color: string
  // the order status this step moves the order to; null: none
  status?: string | null
}

// The four main statuses, tied to themselves even when saved without `status`
const MAIN_IDS = ['ACCEPTED', 'PREPARING', 'SHIPPING', 'FINISHED']

/** The order status a step is tied to, or null. */
export const statusOf = (option: BillingOption): string | null =>
  option.status !== undefined
    ? option.status || null
    : MAIN_IDS.includes(option.id)
    ? option.id
    : null

// Badge look: pale background, dark text
export const BILLING_COLORS: Record<string, string> = {
  brown: 'bg-amber-200 text-amber-950 dark:bg-amber-800 dark:text-amber-100',
  lightGreen: 'bg-lime-200 text-lime-900 dark:bg-lime-500 dark:text-lime-950',
  green: 'bg-green-200 text-green-900 dark:bg-green-600 dark:text-white',
  blue: 'bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-white',
  yellow: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-950',
  pink: 'bg-pink-200 text-pink-900 dark:bg-pink-500 dark:text-white',
  orange: 'bg-orange-300 text-orange-950 dark:bg-orange-500 dark:text-white',
  red: 'bg-red-200 text-red-900 dark:bg-red-600 dark:text-white',
  purple: 'bg-purple-200 text-purple-900 dark:bg-purple-600 dark:text-white',
  teal: 'bg-teal-200 text-teal-900 dark:bg-teal-600 dark:text-white',
  gray: 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white',
  white: 'bg-white text-gray-900 border border-gray-300',
}

// Circle look: `fill` for a ticked step, `ring` for an open one
export const BILLING_DOTS: Record<string, { fill: string; ring: string }> = {
  brown: { fill: 'bg-amber-700 border-amber-700', ring: 'border-amber-700' },
  lightGreen: { fill: 'bg-lime-500 border-lime-500', ring: 'border-lime-500' },
  green: { fill: 'bg-green-600 border-green-600', ring: 'border-green-600' },
  blue: { fill: 'bg-blue-600 border-blue-600', ring: 'border-blue-600' },
  yellow: { fill: 'bg-yellow-400 border-yellow-400', ring: 'border-yellow-400' },
  pink: { fill: 'bg-pink-500 border-pink-500', ring: 'border-pink-500' },
  orange: { fill: 'bg-orange-500 border-orange-500', ring: 'border-orange-500' },
  red: { fill: 'bg-red-600 border-red-600', ring: 'border-red-600' },
  purple: { fill: 'bg-purple-600 border-purple-600', ring: 'border-purple-600' },
  teal: { fill: 'bg-teal-500 border-teal-500', ring: 'border-teal-500' },
  gray: { fill: 'bg-gray-500 border-gray-500', ring: 'border-gray-400' },
  white: { fill: 'bg-white border-gray-400', ring: 'border-gray-400' },
}

export const billingDot = (color?: string) =>
  BILLING_DOTS[color ?? ''] ?? BILLING_DOTS.gray

// The four main order statuses. Their ids are also used by the migration that
// ticked existing orders from their status.
export const DEFAULT_BILLING_OPTIONS: BillingOption[] = [
  { id: 'ACCEPTED', label: 'Accepted', color: 'yellow', status: 'ACCEPTED' },
  { id: 'PREPARING', label: 'In preparation', color: 'white', status: 'PREPARING' },
  { id: 'SHIPPING', label: 'In delivery', color: 'blue', status: 'SHIPPING' },
  { id: 'FINISHED', label: 'Receipt issued', color: 'green', status: 'FINISHED' },
]

// Same ids as the API defaults and the migration
export const DEFAULT_OFFER_OPTIONS: BillingOption[] = [
  { id: 'OFFER_SENT', label: 'Proforma sent', color: 'brown', status: 'PROFORMA_SENT' },
  { id: 'OFFER_PAID', label: 'Paid', color: 'lightGreen', status: null },
  { id: 'OFFER_ACCEPTED', label: 'Accepted, becomes an order', color: 'green', status: 'ACCEPTED' },
]

export const readBillingOptions = (settings: unknown): BillingOption[] => {
  const saved = (settings as { billingOptions?: BillingOption[] } | undefined)
    ?.billingOptions
  return saved?.length ? saved : DEFAULT_BILLING_OPTIONS
}

export const readOfferOptions = (settings: unknown): BillingOption[] => {
  const saved = (settings as { offerOptions?: BillingOption[] } | undefined)
    ?.offerOptions
  return saved?.length ? saved : DEFAULT_OFFER_OPTIONS
}

/** The step lists of orders and of offers, as set in Settings. */
export type StepLists = { orders: BillingOption[]; offers: BillingOption[] }

export const readStepLists = (settings: unknown): StepLists => ({
  orders: readBillingOptions(settings),
  offers: readOfferOptions(settings),
})

/** An offer uses the offer steps, every other order the order steps. */
// an offer, also a cancelled one, follows the offer steps
const isOfferNow = (status: string, isOffer?: boolean) =>
  status === 'PROFORMA_SENT' || (!!isOffer && status === 'DECLINED')

export const listFor = (lists: StepLists, status: string, isOffer?: boolean) =>
  isOfferNow(status, isOffer) ? lists.offers : lists.orders

/** The other list, whose steps an order of this status does not show. */
export const otherList = (lists: StepLists, status: string, isOffer?: boolean) =>
  isOfferNow(status, isOffer) ? lists.orders : lists.offers
