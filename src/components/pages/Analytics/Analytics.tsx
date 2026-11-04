'use client'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Label, Select, Table, TextInput } from 'flowbite-react'
import { useSearchParams } from 'next/navigation'
import { BackofficeAPI, CategoriesAPI, ManufacturesAPI } from '@/services'
import { Analytics as AnalyticsData, AnalyticsRow } from '@/services/backoffice'
import { Loader } from '@/components/common'

const money = (value: number) => `${value.toFixed(2)} KM`
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

type Option = { id: string; name: string }

// every section is its own page, picked from the sidebar
const TABS: Record<string, string> = {
  overview: 'Overview',
  filaments: 'Filaments',
  'top-products': 'Top products',
  'by-category': 'By category',
  'by-manufacturer': 'By manufacturer',
  'top-customers': 'Top customers',
}

const Tile: React.FC<{ label: string; value: string; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
)

const RowsTable: React.FC<{
  rows: (AnalyticsRow & { orders?: number })[]
  label?: string
}> = ({ rows, label = 'Product' }) => (
  <div className="overflow-x-auto">
    <Table>
      <Table.Head>
        <Table.HeadCell>{label}</Table.HeadCell>
        <Table.HeadCell>{tx("Sold")}</Table.HeadCell>
        <Table.HeadCell>{tx("Revenue")}</Table.HeadCell>
        <Table.HeadCell>{tx("Purchase cost")}</Table.HeadCell>
        <Table.HeadCell>{tx("Shipping")}</Table.HeadCell>
        <Table.HeadCell>{tx("Profit")}</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <Table.Row key={row.id}>
            <Table.Cell className="text-gray-900 dark:text-white">
              {row.name}
              {row.orders !== undefined && (
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {row.sku} · {row.orders} orders
                </span>
              )}
            </Table.Cell>
            <Table.Cell>{row.quantity}</Table.Cell>
            <Table.Cell>{money(row.revenue)}</Table.Cell>
            <Table.Cell>{row.hasCost ? money(row.cost) : tx("Not set")}</Table.Cell>
            <Table.Cell>{money(row.shipping)}</Table.Cell>
            <Table.Cell
              className={
                row.profit !== null && row.profit < 0 ? 'text-red-500' : ''
              }
            >
              {row.profit === null ? '—' : money(row.profit)}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
    {rows.length === 0 && (
      <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
        {tx("No sales in this period.")}
      </p>
    )}
  </div>
)

const Analytics = () => {
  const requestedTab = useSearchParams().get('tab') ?? ''
  const tab = TABS[requestedTab] ? requestedTab : 'overview'
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

  const maxRevenue = Math.max(1, ...(data?.days ?? []).map((day) => day.revenue))

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <h2 className="mr-auto text-3xl font-bold text-gray-900 dark:text-white">
          {tx(TABS[tab])}
        </h2>
        <div>
          <Label htmlFor="analytics-from" value={tx("From")} />
          <TextInput
            id="analytics-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="analytics-to" value={tx("To")} />
          <TextInput
            id="analytics-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
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
        <div>
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
        <div>
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

          {tab === 'overview' && (
          <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label={tx("Orders")} value={String(data.totals.orders)} />
            <Tile label={tx("Items sold")} value={String(data.totals.itemsSold)} />
            <Tile
              label={tx("Revenue")}
              value={money(data.totals.revenue)}
              hint="Products, after discounts"
            />
            <Tile
              label={tx("Profit")}
              value={money(data.totals.profit)}
              hint="Revenue + shipping charged - shipping cost - purchase cost"
            />
            <Tile label={tx("Purchase cost")} value={money(data.totals.goodsCost)} />
            <Tile
              label={tx("Shipping charged")}
              value={money(data.totals.shippingCharged)}
            />
            <Tile
              label={tx("Shipping cost")}
              value={money(data.totals.shippingCost)}
              hint="Delivery cost from the settings, per order"
            />
          </div>

          <section id="revenue-by-day">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {tx("Revenue by day")}
            </h3>
            <div className="flex items-end gap-1 h-40 overflow-x-auto">
              {data.days.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${money(day.revenue)}, ${day.orders} orders`}
                  className="min-w-[8px] flex-1 bg-purple-500 rounded-t"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                />
              ))}
            </div>
          </section>

          </>
          )}

          {tab === 'filaments' && (
          <section id="filaments">
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              {tx("Filaments")}
            </h3>
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              {data.filaments.quantity} pcs sold, revenue{' '}
              {money(data.filaments.revenue)}, purchase cost{' '}
              {money(data.filaments.cost)}, profit{' '}
              {money(data.filaments.profit)}
              {data.filaments.missingCost > 0 &&
                ` (${data.filaments.missingCost} products without a purchase price are left out of the profit)`}
              . Shipping is the share of each line in what delivery earned or lost.
            </p>
            <RowsTable rows={data.filaments.rows} />
          </section>
          )}

          {tab === 'top-products' && (
          <section id="top-products">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {tx("Top products")}
            </h3>
            <RowsTable rows={data.topProducts} />
          </section>
          )}

          {tab === 'by-category' && (
          <section id="by-category">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {tx("By category")}
            </h3>
            <RowsTable rows={data.byCategory} label={tx("Category")} />
          </section>
          )}

          {tab === 'by-manufacturer' && (
          <section id="by-manufacturer">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {tx("By manufacturer")}
            </h3>
            <RowsTable rows={data.byManufacturer} label={tx("Manufacturer")} />
          </section>
          )}

          {tab === 'top-customers' && (
          <section id="top-customers">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              {tx("Top customers")}
            </h3>
            <RowsTable rows={data.topCustomers} label={tx("Customer")} />
          </section>
          )}

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
