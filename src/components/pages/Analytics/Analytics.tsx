'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Label, Select, Table, TextInput } from 'flowbite-react'
import { BackofficeAPI, CategoriesAPI, ManufacturesAPI } from '@/services'
import { Analytics as AnalyticsData, AnalyticsRow } from '@/services/backoffice'
import { Loader } from '@/components/common'

const money = (value: number) => `${value.toFixed(2)} KM`
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

type Option = { id: string; name: string }

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
        <Table.HeadCell>Sold</Table.HeadCell>
        <Table.HeadCell>Revenue</Table.HeadCell>
        <Table.HeadCell>Purchase cost</Table.HeadCell>
        <Table.HeadCell>Shipping</Table.HeadCell>
        <Table.HeadCell>Profit</Table.HeadCell>
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
            <Table.Cell>{row.hasCost ? money(row.cost) : 'Not set'}</Table.Cell>
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
        No sales in this period.
      </p>
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
          Analytics
        </h2>
        <div>
          <Label htmlFor="analytics-from" value="From" />
          <TextInput
            id="analytics-from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="analytics-to" value="To" />
          <TextInput
            id="analytics-to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="analytics-category" value="Category" />
          <Select
            id="analytics-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="analytics-manufacturer" value="Manufacturer" />
          <Select
            id="analytics-manufacturer"
            value={manufacturerId}
            onChange={(e) => setManufacturerId(e.target.value)}
          >
            <option value="">All manufacturers</option>
            {manufacturers.map((manufacturer) => (
              <option key={manufacturer.id} value={manufacturer.id}>
                {manufacturer.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="analytics-customer" value="Customer" />
          <TextInput
            id="analytics-customer"
            placeholder="Name, company or email"
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
          />
        </div>
        {filtered && (
          <Button color="gray" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
      {filtered && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A category includes its subcategories. With a category or
          manufacturer chosen, only those products count, and each order
          carries its share of delivery.
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
                Actions needed
              </a>
              .
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile label="Orders" value={String(data.totals.orders)} />
            <Tile label="Items sold" value={String(data.totals.itemsSold)} />
            <Tile
              label="Revenue"
              value={money(data.totals.revenue)}
              hint="Products, after discounts"
            />
            <Tile
              label="Profit"
              value={money(data.totals.profit)}
              hint="Revenue + shipping charged - shipping cost - purchase cost"
            />
            <Tile label="Purchase cost" value={money(data.totals.goodsCost)} />
            <Tile
              label="Shipping charged"
              value={money(data.totals.shippingCharged)}
            />
            <Tile
              label="Shipping cost"
              value={money(data.totals.shippingCost)}
              hint="Delivery cost from the settings, per order"
            />
          </div>

          <section id="revenue-by-day">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Revenue by day
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

          <section id="filaments">
            <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Filaments
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

          <section id="top-products">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Top products
            </h3>
            <RowsTable rows={data.topProducts} />
          </section>

          <section id="by-category">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              By category
            </h3>
            <RowsTable rows={data.byCategory} label="Category" />
          </section>

          <section id="by-manufacturer">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              By manufacturer
            </h3>
            <RowsTable rows={data.byManufacturer} label="Manufacturer" />
          </section>

          <section id="top-customers">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Top customers
            </h3>
            <RowsTable rows={data.topCustomers} label="Customer" />
          </section>

          <div className="flex flex-wrap gap-2">
            <Button color="gray" size="sm" onClick={load}>
              Refresh
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
