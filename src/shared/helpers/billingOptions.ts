export type BillingOption = { id: string; label: string; color: string }

export const BILLING_COLORS: Record<string, string> = {
  brown: 'bg-amber-200 text-amber-950 dark:bg-amber-800 dark:text-amber-100',
  lightGreen: 'bg-lime-200 text-lime-900 dark:bg-lime-500 dark:text-lime-950',
  green: 'bg-green-200 text-green-900 dark:bg-green-600 dark:text-white',
  blue: 'bg-blue-200 text-blue-900 dark:bg-blue-500 dark:text-white',
  yellow: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-400 dark:text-yellow-950',
  pink: 'bg-pink-200 text-pink-900 dark:bg-pink-500 dark:text-white',
  orange: 'bg-orange-300 text-orange-950 dark:bg-orange-500 dark:text-white',
  gray: 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white',
}

// The ids of the first two are also used by the API and the migration
export const DEFAULT_BILLING_OPTIONS: BillingOption[] = [
  { id: 'PROFORMA_SENT', label: 'Proforma sent', color: 'brown' },
  { id: 'PAID', label: 'Paid', color: 'lightGreen' },
  { id: 'INVOICED', label: 'Invoiced', color: 'green' },
]

export const readBillingOptions = (settings: unknown): BillingOption[] => {
  const saved = (settings as { billingOptions?: BillingOption[] } | undefined)
    ?.billingOptions
  return saved?.length ? saved : DEFAULT_BILLING_OPTIONS
}
