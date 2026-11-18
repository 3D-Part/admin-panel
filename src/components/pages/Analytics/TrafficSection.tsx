'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { BackofficeAPI } from '@/services'
import { SiteTraffic, TrafficProduct } from '@/services/backoffice'
import { productLink } from './Analytics'

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://3dpartshop.com'
const number = (value: number) => value.toLocaleString('de-DE')
const th = 'px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-400'
const num = 'px-3 py-2 text-right whitespace-nowrap'

// the share of views that ended in the cart
const rate = (row: TrafficProduct) =>
  row.views > 0 ? `${Math.round((row.adds / row.views) * 100)}%` : '—'

const Box: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <div className="min-w-0 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="p-3">
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="max-h-[420px] overflow-auto">{children}</div>
  </div>
)

const Empty = () => (
  <p className="px-3 pb-3 text-sm text-gray-500 dark:text-gray-400">{tx('Nothing counted in this period yet.')}</p>
)

const ProductTable: React.FC<{ rows: TrafficProduct[] }> = ({ rows }) =>
  rows.length === 0 ? (
    <Empty />
  ) : (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className={th}>{tx('Product')}</th>
          <th className={`${th} text-right`}>{tx('Views')}</th>
          <th className={`${th} text-right`}>{tx('Into cart')}</th>
          <th className={`${th} text-right`} title={tx('Share of views that ended in the cart')}>
            %
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
        {rows.map((row) => (
          <tr key={row.productId}>
            <td className="px-3 py-2">
              <a
                href={productLink(row)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-purple-700 hover:underline dark:hover:text-purple-300"
              >
                {row.name}
              </a>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{row.sku}</span>
            </td>
            <td className={num}>{number(row.views)}</td>
            <td className={num}>{number(row.adds)}</td>
            <td className={num}>{rate(row)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

/**
 * What visitors did on the site in the period: the most visited pages, the
 * most viewed products and the products most often put into the cart. The
 * site counts only per day, nothing about the visitor; crawlers are left out.
 */
const TrafficSection: React.FC<{ from: string; to: string }> = ({ from, to }) => {
  const [data, setData] = useState<SiteTraffic | null>(null)

  useEffect(() => {
    let live = true
    setData(null)
    BackofficeAPI.getTraffic(from, to).then((result) => live && setData(result ?? null))
    return () => {
      live = false
    }
  }, [from, to])

  return (
    <section
      id="traffic"
      className="scroll-mt-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{tx('Site visits')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tx('Pages opened, products viewed and put into the cart in the period. Only counts per day are kept, nothing about the visitor.')}
          </p>
        </div>
        {data && (
          <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300">
            <span>
              {tx('Pages opened')}: <strong>{number(data.totals.pages)}</strong>
            </span>
            <span>
              {tx('Product views')}: <strong>{number(data.totals.views)}</strong>
            </span>
            <span>
              {tx('Into cart')}: <strong>{number(data.totals.adds)}</strong>
            </span>
          </div>
        )}
      </div>

      {!data ? (
        <p className="text-sm text-gray-500">…</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <Box title={tx('Most visited pages')} description={tx('How many times each page was opened.')}>
            {data.pages.length === 0 ? (
              <Empty />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th}>{tx('Page')}</th>
                    <th className={`${th} text-right`}>{tx('Visits')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
                  {data.pages.map((row) => (
                    <tr key={row.path}>
                      <td className="break-words px-3 py-2 [overflow-wrap:anywhere]" title={row.path}>
                        <a
                          href={`${SITE}${row.path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-purple-700 hover:underline dark:hover:text-purple-300"
                        >
                          {row.path === '/' ? tx('Home page') : row.title ? `${tx('Product')}: ${row.title}` : row.path}
                        </a>
                      </td>
                      <td className={num}>{number(row.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
          <Box title={tx('Most viewed products')} description={tx('Product pages opened.')}>
            <ProductTable rows={data.viewed} />
          </Box>
          <Box title={tx('Most added to the cart')} description={tx('How many times a product was put into the cart.')}>
            <ProductTable rows={data.added} />
          </Box>
        </div>
      )}
    </section>
  )
}

export default TrafficSection
