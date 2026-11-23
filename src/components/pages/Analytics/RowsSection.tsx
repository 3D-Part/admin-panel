'use client'
import { productCodes } from '@/components/common/ProductCodes/ProductCodes'
import { SaleDots } from '@/components/common/SaleMarks/SaleMarks'
import { tx } from '@/shared/i18n'

import React, { useMemo, useState } from 'react'
import { Select, Table, TextInput } from 'flowbite-react'
import { AnalyticsRow } from '@/services/backoffice'

// thousands grouped, two decimals: 278.804,90 KM
const money = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`

type Row = AnalyticsRow & { orders?: number }
type Sort = 'revenue' | 'quantity' | 'profit' | 'name'

const SHOWN = 10

/**
 * One part of the analytics page: a heading, an optional line under it and
 * the rows as a table. The first rows show, the rest behind "Show all". With
 * `tools` the rows can be searched and sorted.
 */
const RowsSection: React.FC<{
  id: string
  title: string
  description?: React.ReactNode
  rows: Row[]
  label?: string
  tools?: boolean
  // where a row leads, e.g. the product or the customer's orders
  linkFor?: (row: Row) => string | null
}> = ({ id, title, description, rows, label = 'Product', tools = false, linkFor }) => {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('revenue')
  const [all, setAll] = useState(false)

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase()
    const found = term
      ? rows.filter((row) =>
          `${row.name} ${row.sku ?? ''} ${row.code ?? ''}`.toLowerCase().includes(term)
        )
      : rows
    return [...found].sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name)
        : sort === 'profit'
        ? (b.profit ?? -Infinity) - (a.profit ?? -Infinity)
        : b[sort] - a[sort]
    )
  }, [rows, query, sort])

  const visible = all ? shown : shown.slice(0, SHOWN)

  return (
    <section
      id={id}
      className="scroll-mt-4 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}{' '}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({rows.length})
            </span>
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {tools && rows.length > 0 && (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <TextInput
              aria-label={tx('Search')}
              placeholder={tx('Name or code')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 sm:w-56"
            />
            <Select
              aria-label={tx('Sort by')}
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="revenue">{tx('Revenue')}</option>
              <option value="quantity">{tx('Pieces sold')}</option>
              <option value="profit">{tx('Profit')}</option>
              <option value="name">{tx('Name')}</option>
            </Select>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400">
          {tx('No sales in this period.')}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table className="table-stack">
              <Table.Head>
                <Table.HeadCell>{label}</Table.HeadCell>
                <Table.HeadCell>{tx('Sold')}</Table.HeadCell>
                <Table.HeadCell>{tx('Revenue')}</Table.HeadCell>
                <Table.HeadCell>{tx('Purchase cost')}</Table.HeadCell>
                <Table.HeadCell>{tx('Shipping')}</Table.HeadCell>
                <Table.HeadCell>{tx('Profit')}</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
                {visible.map((row) => (
                  <Table.Row key={row.id}>
                    <Table.Cell data-label={label} className="text-gray-900 dark:text-white">
                      {linkFor && linkFor(row) ? (
                        <a
                          href={linkFor(row) as string}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-700 hover:underline dark:text-purple-300"
                        >
                          {row.name}
                        </a>
                      ) : (
                        row.name
                      )}
                      {(row.sku || row.code || row.orders !== undefined) && (
                        <span className="block text-xs text-gray-500 dark:text-gray-400">
                          {row.code && <SaleDots productId={row.id} className="mr-1.5" />}
                          {[productCodes(row), row.orders !== undefined && `${row.orders} ${tx('orders')}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell data-label={tx('Sold')}>{row.quantity}</Table.Cell>
                    <Table.Cell data-label={tx('Revenue')}>{money(row.revenue)}</Table.Cell>
                    <Table.Cell data-label={tx('Purchase cost')}>
                      {row.hasCost ? money(row.cost) : tx('Not set')}
                    </Table.Cell>
                    <Table.Cell data-label={tx('Shipping')}>{money(row.shipping)}</Table.Cell>
                    <Table.Cell
                      data-label={tx('Profit')}
                      className={row.profit !== null && row.profit < 0 ? 'text-red-500' : ''}
                    >
                      {row.profit === null ? '—' : money(row.profit)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {shown.length > SHOWN && (
            <div className="border-t border-gray-100 p-3 text-center dark:border-gray-700">
              <button
                type="button"
                onClick={() => setAll(!all)}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {all ? tx('Show fewer') : tx('Show all ({count})', { count: shown.length })}
              </button>
            </div>
          )}
          {query && shown.length === 0 && (
            <p className="px-4 pb-4 text-sm text-gray-500 dark:text-gray-400">
              {tx('No product found')}
            </p>
          )}
        </>
      )}
    </section>
  )
}

export default RowsSection
