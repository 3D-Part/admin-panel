'use client'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Label, Select, TextInput } from 'flowbite-react'
import { BackofficeAPI, CategoriesAPI, ManufacturesAPI } from '@/services'
import { Analytics as AnalyticsData } from '@/services/backoffice'
import RevenueChart from './RevenueChart'
import RowsSection from './RowsSection'
import ShippingSection from './ShippingSection'
import DetailModal, { DetailKind } from './DetailModal'
import TrafficSection from './TrafficSection'
import { Loader } from '@/components/common'

// thousands grouped, two decimals: 278.804,90 KM
const money = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

type Option = { id: string; name: string }

// the parts below the chart, in page order
const SECTIONS = [
  { id: 'shipping', title: 'Shipping' },
  { id: 'sold-products', title: 'Sold products' },
  { id: 'by-category', title: 'By category' },
  { id: 'by-manufacturer', title: 'By manufacturer' },
  { id: 'filaments', title: 'Filaments' },
  { id: 'top-customers', title: 'Top customers' },
  { id: 'traffic', title: 'Site visits' },
]

// where a row of a table leads (all in a new tab, the analytics stay as they are)
const q = (params: Record<string, string>) => new URLSearchParams(params).toString()
export const productLink = (row: { name: string; sku?: string }) =>
  `/products?${q({ key: row.sku || row.name, label: row.name })}`
const categoryLink = (row: { id: string; name: string }) =>
  row.id === 'none' ? null : `/products?${q({ categoryId: row.id, label: row.name })}`
const manufacturerLink = (row: { id: string; name: string }) =>
  row.id === 'none' ? null : `/products?${q({ manufacturerId: row.id, label: row.name })}`
// a customer's orders: by e-mail, or by e-mail and name when many people
// ordered under the same e-mail (orders typed in by the staff)
const customerLink = (row: {
  name: string
  sku?: string
  filter?: { email?: string; field?: string; name?: string }
}) => {
  const filter = row.filter ?? (row.sku ? { email: row.sku } : null)
  if (!filter?.email && !filter?.name) return null
  return `/orders?${q({
    ...(filter.email ? { customer: filter.email } : {}),
    ...(filter.name && filter.field ? { field: filter.field, name: filter.name } : {}),
    label: row.name,
  })}`
}

const Tile: React.FC<{
  label: string
  value: string
  hint?: string
  // a small link under the figure, e.g. to the form further down
  action?: { text: string; href: string }
  // opens the details behind the figure
  onOpen?: () => void
}> = ({ label, value, hint, action, onOpen }) => (
  <div
    {...(onOpen && {
      role: 'button',
      tabIndex: 0,
      onClick: onOpen,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      },
    })}
    className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
      onOpen
        ? 'group relative cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:border-purple-400 hover:shadow-lg active:translate-y-0 active:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
        : ''
    }`}
  >
    {onOpen && (
      <span
        aria-hidden
        className="absolute right-3 top-3 text-purple-500 opacity-0 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
      >
        →
      </span>
    )}
    <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-300">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    {action && (
      <a
        href={action.href}
        onClick={(e) => e.stopPropagation()}
        className="mt-2 inline-flex items-center rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-purple-700 hover:bg-gray-100 dark:border-gray-600 dark:text-purple-300 dark:hover:bg-gray-700"
      >
        + {action.text}
      </a>
    )}
  </div>
)

const Analytics = () => {
  const today = new Date()
  const [from, setFrom] = useState(
    isoDay(new Date(today.getTime() - 30 * 86400000))
  )
  const [to, setTo] = useState(isoDay(today))
  const [categoryId, setCategoryId] = useState('')
  const [manufacturerId, setManufacturerId] = useState('')
  const [customerInput, setCustomerInput] = useState('')
  const [customer, setCustomer] = useState('')
  const [categories, setCategories] = useState<Option[]>([])
  const [manufacturers, setManufacturers] = useState<Option[]>([])
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<DetailKind | null>(null)

  useEffect(() => {
    const sort = { field: 'name', order: 'ASC' as const }
    const all = { offset: 0, limit: 1000 }
    CategoriesAPI.getCategories(sort, all).then((result) =>
      setCategories(result?.rows ?? [])
    )
    ManufacturesAPI.getManufactures(sort, all).then((result) =>
      setManufacturers(result?.rows ?? [])
    )
  }, [])

  // typing a name should not fire a request on every key
  useEffect(() => {
    const timer = setTimeout(() => setCustomer(customerInput.trim()), 400)
    return () => clearTimeout(timer)
  }, [customerInput])

  // the same period and filters as the figures, for the details behind them
  const filters = useMemo(
    () => ({
      from,
      to,
      ...(categoryId && { categoryId }),
      ...(manufacturerId && { manufacturerId }),
      ...(customer && { customer }),
    }),
    [from, to, categoryId, manufacturerId, customer]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setData(
      await BackofficeAPI.getAnalytics({
        from,
        to,
        ...(categoryId && { categoryId }),
        ...(manufacturerId && { manufacturerId }),
        ...(customer && { customer }),
      })
    )
    setLoading(false)
  }, [from, to, categoryId, manufacturerId, customer])

  useEffect(() => {
    load()
  }, [load])

  const filtered = Boolean(categoryId || manufacturerId || customer)
  const clearFilters = () => {
    setCategoryId('')
    setManufacturerId('')
    setCustomerInput('')
    setCustomer('')
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <h2 className="w-full sm:w-auto mr-auto text-3xl font-bold text-gray-900 dark:text-white">
          {tx('Analytics')}
        </h2>
        <div className="w-[calc(50%-0.5rem)] sm:w-auto [&_input]:w-full">
          <Label htmlFor="analytics-from" value={tx("From")} />
          <TextInput
            id="analytics-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="w-[calc(50%-0.5rem)] sm:w-auto [&_input]:w-full">
          <Label htmlFor="analytics-to" value={tx("To")} />
          <TextInput
            id="analytics-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="analytics-category" value={tx("Category")} />
          <Select
            id="analytics-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{tx("All categories")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="analytics-manufacturer" value={tx("Manufacturer")} />
          <Select
            id="analytics-manufacturer"
            value={manufacturerId}
            onChange={(e) => setManufacturerId(e.target.value)}
          >
            <option value="">{tx("All manufacturers")}</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="analytics-customer" value={tx("Customer")} />
          <TextInput
            id="analytics-customer"
            placeholder={tx("Name, company or email")}
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
          />
        </div>
        {filtered && (
          <Button color="gray" onClick={clearFilters}>
            {tx("Clear filters")}
          </Button>
        )}
      </div>
      {filtered && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tx("A category includes its subcategories. With a category or manufacturer chosen, only those products count, and each order carries its share of delivery.")}
        </p>
      )}

      {loading && <Loader />}

      {!loading && data && (
        <>
          {data.totals.missingCostItems > 0 && (
            <Alert color="warning">
              {data.totals.missingCostItems} sold items have no purchase price,
              so the profit below is too high. Add the prices in{' '}
              <a className="underline" href="/actions-needed">
                {tx("Actions needed")}
              </a>
              .
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label={tx("Orders")} value={String(data.totals.orders)} onOpen={() => setDetail("orders")} />
            <Tile label={tx("Items sold")} value={String(data.totals.itemsSold)} onOpen={() => setDetail("items")} />
            <Tile
              label={tx("Revenue")}
              value={money(data.totals.revenue)}
              hint={tx("Products, after discounts")}
              onOpen={() => setDetail("revenue")}
            />
            <Tile
              label={tx("Profit")}
              value={money(data.totals.profit)}
              hint={tx("Revenue + shipping charged - shipping cost - purchase cost")}
              onOpen={() => setDetail("profit")}
            />
            <Tile label={tx("Purchase cost")} value={money(data.totals.goodsCost)} onOpen={() => setDetail("cost")} />
            <Tile
              label={tx("Shipping paid by customers")}
              value={money(data.totals.shippingCharged)}
              hint={tx("{orders} orders", { orders: data.totals.shippingChargedOrders })}
              onOpen={() => setDetail("shipping-customers")}
            />
            <Tile
              label={tx("Shipping paid by us")}
              value={money(data.totals.shippingCost)}
              hint={`${tx("{orders} orders", { orders: data.totals.shippingCostOrders })}${
                data.totals.shippingEstimated ? ` · ${tx("estimate")}` : ''
              }`}
              action={{ text: tx("Add"), href: "#shipping" }}
              onOpen={() => document.getElementById("shipping")?.scrollIntoView({ behavior: "smooth" })}
            />
          </div>

          <DetailModal kind={detail} data={data} filters={filters} onClose={() => setDetail(null)} />

          <RevenueChart days={data.days} from={from} to={to} />

          <ShippingSection
            totals={data.totals}
            entries={data.shippingPaid ?? []}
            to={to}
            onChange={load}
          />

          {/* jump to a part of the page */}
          <nav aria-label={tx("Parts of the page")} className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {tx(section.title)}
              </a>
            ))}
          </nav>

          <RowsSection
            id="sold-products"
            linkFor={productLink}
            title={tx("Sold products")}
            description={tx("Every product sold in the period.")}
            rows={data.soldProducts ?? data.topProducts}
            label={tx("Product")}
            tools
          />
          <RowsSection
            id="by-category"
            linkFor={categoryLink}
            title={tx("By category")}
            rows={data.byCategory}
            label={tx("Category")}
          />
          <RowsSection
            id="by-manufacturer"
            linkFor={manufacturerLink}
            title={tx("By manufacturer")}
            rows={data.byManufacturer}
            label={tx("Manufacturer")}
          />
          <RowsSection
            id="filaments"
            linkFor={productLink}
            title={tx("Filaments")}
            description={tx(
              "{quantity} pcs sold, revenue {revenue}, purchase cost {cost}, profit {profit}. Shipping is the share of each line in what delivery earned or lost.",
              {
                quantity: data.filaments.quantity,
                revenue: money(data.filaments.revenue),
                cost: money(data.filaments.cost),
                profit: money(data.filaments.profit),
              }
            )}
            rows={data.filaments.rows}
            label={tx("Product")}
            tools
          />
          <RowsSection
            id="top-customers"
            linkFor={customerLink}
            title={tx("Top customers")}
            rows={data.topCustomers}
            label={tx("Customer")}
          />

          <TrafficSection from={from} to={to} />

          <div className="flex flex-wrap gap-2">
            <Button color="gray" size="sm" onClick={load}>
              {tx("Refresh")}
            </Button>
            <Button
              color="gray"
              size="sm"
              onClick={() => BackofficeAPI.downloadExport('orders', { from, to })}
            >
              Export orders of this period (CSV)
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default Analytics
