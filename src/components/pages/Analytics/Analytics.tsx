'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Label, Table, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'
import { Analytics as AnalyticsData, AnalyticsRow } from '@/services/backoffice'
import { Loader } from '@/components/common'

const money = (value: number) => `${value.toFixed(2)} KM`
const isoDay = (date: Date) => date.toISOString().slice(0, 10)

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

const RowsTable: React.FC<{ rows: AnalyticsRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <Table>
      <Table.Head>
        <Table.HeadCell>Product</Table.HeadCell>
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
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setData(await BackofficeAPI.getAnalytics(from, to))
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

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
      </div>

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

          <section>
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

          <section>
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

          <section>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Top products
            </h3>
            <RowsTable rows={data.topProducts} />
          </section>

          <Button color="gray" size="sm" onClick={load}>
            Refresh
          </Button>
        </>
      )}
    </div>
  )
}

export default Analytics
