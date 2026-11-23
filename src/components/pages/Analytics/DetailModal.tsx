'use client'
import { CustomerFlagFor } from '@/components/common/CustomerFlag/CustomerFlag'
import { productCodes } from '@/components/common/ProductCodes/ProductCodes'
import { SaleDots } from '@/components/common/SaleMarks/SaleMarks'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'flowbite-react'
import { BackofficeAPI } from '@/services'
import {
  Analytics as AnalyticsData,
  AnalyticsFilters,
  AnalyticsOrder,
} from '@/services/backoffice'

const PAGE_SIZE = 25

const productLink = (row: { name: string; sku?: string }) =>
  `/products?${new URLSearchParams({ key: row.sku || row.name, label: row.name })}`

export type DetailKind =
  | 'orders'
  | 'items'
  | 'revenue'
  | 'profit'
  | 'cost'
  | 'shipping-customers'

// thousands grouped, two decimals: 278.804,90 KM
const money = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`
const dateLabel = (value: string) => value.slice(0, 10).split('-').reverse().join('.')

// an order opens on the Orders page, in a new tab so the analytics stay as they are
const orderHref = (orderNumber: string) => `/orders?order=${encodeURIComponent(orderNumber)}`
const openOrder = (orderNumber: string) => window.open(orderHref(orderNumber), '_blank')

const th = 'px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-400'
const num = 'px-3 py-2 text-right whitespace-nowrap'
const cell = 'px-3 py-2'

const Table: React.FC<{ head: { text: string; right?: boolean }[]; children: React.ReactNode }> = ({
  head,
  children,
}) => (
  <div className="max-h-[60vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className="w-full text-sm text-gray-900 dark:text-gray-100">
      <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
        <tr>
          {head.map((h) => (
            <th key={h.text} className={`${th} ${h.right ? 'text-right' : ''}`}>
              {h.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
    </table>
  </div>
)

const TITLES: Record<DetailKind, string> = {
  orders: 'Orders',
  items: 'Items sold',
  revenue: 'Revenue',
  profit: 'Profit',
  cost: 'Purchase cost',
  'shipping-customers': 'Shipping paid by customers',
}

// "26–50 of 983" with previous / next
const Pager: React.FC<{
  page: number
  total: number
  loading?: boolean
  onPage: (page: number) => void
}> = ({ page, total, loading, onPage }) => {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (total <= PAGE_SIZE) return null
  const first = page * PAGE_SIZE + 1
  const last = Math.min(total, (page + 1) * PAGE_SIZE)
  return (
    <div className="mt-3 flex items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span>{tx('{first}–{last} of {total}', { first, last, total })}</span>
      <div className="flex items-center gap-2">
        <Button size="xs" color="gray" disabled={page === 0 || loading} onClick={() => onPage(page - 1)}>
          {tx('Previous')}
        </Button>
        <span>
          {page + 1} / {pages}
        </span>
        <Button
          size="xs"
          color="gray"
          disabled={page + 1 >= pages || loading}
          onClick={() => onPage(page + 1)}
        >
          {tx('Next')}
        </Button>
      </div>
    </div>
  )
}

const OrdersTable: React.FC<{ list: AnalyticsOrder[]; withShipping: boolean; loading: boolean }> = ({
  list,
  withShipping,
  loading,
}) => (
  <div className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
    <Table
      head={[
        { text: tx('Order') },
        { text: tx('Date') },
        { text: tx('Customer') },
        { text: tx('Status') },
        { text: tx('Items'), right: true },
        { text: tx('Revenue'), right: true },
        ...(withShipping ? [{ text: tx('Shipping'), right: true }] : []),
        { text: tx('Total'), right: true },
      ]}
    >
      {list.map((order) => (
        <tr
          key={order.id}
          onClick={() => openOrder(order.orderNumber)}
          className="cursor-pointer transition-colors hover:bg-purple-50 dark:hover:bg-gray-700"
        >
          <td className={`${cell} whitespace-nowrap font-medium`}>
            <a
              href={orderHref(order.orderNumber)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-purple-700 hover:underline dark:text-purple-300"
            >
              {order.orderNumber}
            </a>
          </td>
          <td className={`${cell} whitespace-nowrap`}>{dateLabel(order.createdAt)}</td>
          <td className={cell}>
            <a
              href={`/orders?${new URLSearchParams({ customer: order.email, label: order.name || order.email })}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-purple-700 hover:underline dark:hover:text-purple-300"
            >
              {order.name || order.email}
            </a>
            <span className="ml-1 inline-flex align-middle">
              <CustomerFlagFor email={order.email} />
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">{order.email}</span>
          </td>
          <td className={`${cell} whitespace-nowrap`}>{order.status.replace(/_/g, ' ')}</td>
          <td className={num}>{order.quantity}</td>
          <td className={num}>{money(order.revenue)}</td>
          {withShipping && <td className={num}>{money(order.shippingCharged)}</td>}
          <td className={num}>{money(order.total)}</td>
        </tr>
      ))}
    </Table>
  </div>
)

// the orders are fetched one page at a time, so a big period stays fast
const OrdersDetail: React.FC<{
  filters: AnalyticsFilters
  sort?: 'revenue'
  shippingOnly?: boolean
  note?: string
}> = ({ filters, sort, shippingOnly, note }) => {
  const [page, setPage] = useState(0)
  const [list, setList] = useState<AnalyticsOrder[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let current = true
    setLoading(true)
    BackofficeAPI.getAnalyticsOrders(filters, {
      offset: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      ...(sort && { sort }),
      ...(shippingOnly && { shippingOnly }),
    }).then((result) => {
      if (!current) return
      if (result) {
        setList(result.rows)
        setTotal(result.count)
      }
      setLoading(false)
    })
    return () => {
      current = false
    }
  }, [filters, page, sort, shippingOnly])

  return (
    <>
      {note && <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{note}</p>}
      <OrdersTable list={list} withShipping={Boolean(shippingOnly)} loading={loading} />
      <Pager page={page} total={total} loading={loading} onPage={setPage} />
    </>
  )
}

// the sold items are already loaded; only a page of them is drawn
const ItemsDetail: React.FC<{ data: AnalyticsData; withCost: boolean }> = ({ data, withCost }) => {
  const [page, setPage] = useState(0)
  const { totals } = data
  const rows = withCost ? data.soldProducts.filter((r) => r.hasCost) : data.soldProducts
  const shown = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  return (
    <>
      {withCost && totals.missingCostItems > 0 && (
        <p className="mb-3 text-sm text-amber-700 dark:text-amber-400">
          {tx('{count} sold items have no purchase price and are not in this list.', {
            count: totals.missingCostItems,
          })}
        </p>
      )}
      <Table
        head={[
          { text: tx('Product') },
          { text: tx('Quantity'), right: true },
          { text: tx('Revenue'), right: true },
          ...(withCost ? [{ text: tx('Purchase cost'), right: true }] : []),
        ]}
      >
        {shown.map((row) => (
          <tr key={row.id}>
            <td className={cell}>
              <a
                href={productLink(row)}
                target="_blank"
                rel="noreferrer"
                className="text-purple-700 hover:underline dark:text-purple-300"
              >
                {row.name}
              </a>
              {(row.sku || row.code) && (
                <span className="block font-mono text-xs text-gray-500 dark:text-gray-400">
                  <SaleDots productId={row.id} className="mr-1.5" />
                  {productCodes(row)}
                </span>
              )}
            </td>
            <td className={num}>{row.quantity}</td>
            <td className={num}>{money(row.revenue)}</td>
            {withCost && <td className={num}>{money(row.cost)}</td>}
          </tr>
        ))}
      </Table>
      <Pager page={page} total={rows.length} onPage={setPage} />
    </>
  )
}

/**
 * What is behind a figure of the overview: the orders of the period, the sold
 * items, or how the profit is put together. Orders come a page at a time from
 * the API with the same period and filters as the figures.
 */
const DetailModal: React.FC<{
  kind: DetailKind | null
  data: AnalyticsData
  filters: AnalyticsFilters
  onClose: () => void
}> = ({ kind, data, filters, onClose }) => {
  const { totals } = data

  const body = () => {
    if (!kind) return null
    if (kind === 'orders') return <OrdersDetail filters={filters} />
    if (kind === 'revenue') {
      return (
        <OrdersDetail
          filters={filters}
          sort="revenue"
          note={tx('Products after discounts, biggest orders first.')}
        />
      )
    }
    if (kind === 'shipping-customers') return <OrdersDetail filters={filters} shippingOnly />
    if (kind === 'items' || kind === 'cost') {
      return <ItemsDetail data={data} withCost={kind === 'cost'} />
    }
    // profit: the sum, line by line
    const lines: [string, number, string][] = [
      [tx('Revenue'), totals.revenue, '+'],
      [tx('Shipping paid by customers'), totals.shippingCharged, '+'],
      [tx('Shipping paid by us'), totals.shippingCost, '−'],
      [tx('Purchase cost'), totals.goodsCost, '−'],
    ]
    return (
      <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
        {lines.map(([name, value, sign]) => (
          <div key={name} className="flex justify-between border-b border-gray-200 py-1 dark:border-gray-700">
            <span>
              {sign} {name}
            </span>
            <span>{money(value)}</span>
          </div>
        ))}
        <div className="flex justify-between py-1 text-base font-bold">
          <span>= {tx('Profit')}</span>
          <span>{money(totals.profit)}</span>
        </div>
        {totals.shippingEstimated && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tx('The shipping we paid is an estimate until the courier invoices are entered.')}
          </p>
        )}
        {totals.missingCostItems > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tx('{count} sold items have no purchase price, so the profit is too high.', {
              count: totals.missingCostItems,
            })}
          </p>
        )}
      </div>
    )
  }

  return (
    <Modal show={kind !== null} onClose={onClose} size="5xl" dismissible>
      <Modal.Header>{kind ? tx(TITLES[kind]) : ''}</Modal.Header>
      <Modal.Body>{body()}</Modal.Body>
    </Modal>
  )
}

export default DetailModal
