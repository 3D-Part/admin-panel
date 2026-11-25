'use client'

import BackofficeAPI, { PromoCodeStatsData, PromoCodeStatsRow } from '@/services/backoffice'
import { tx } from '@/shared/i18n'
import { Button, Spinner, TextInput } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API } from '@/shared/helpers'
import { usePromoCodesSliceStore } from '@/store/store'
import { URLPartsEnum } from '@/shared/enums'
import { PromoCode } from '@/shared/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

const km = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`
const date = (value: string | null) => (value ? new Date(value).toLocaleDateString('de-DE') : '—')

type SortKey = 'uses' | 'saved' | 'revenue' | 'lastUsed' | 'code'

const STATE_STYLE: Record<PromoCodeStatsRow['state'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  ended: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
  deleted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
}
const STATE_TEXT: Record<PromoCodeStatsRow['state'], string> = {
  active: 'Active',
  upcoming: 'Not started',
  ended: 'Ended',
  deleted: 'Deleted code',
}

const Tile: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
)

// the orders of a code, in All orders
const ordersLink = (row: PromoCodeStatsRow) =>
  `/orders?${new URLSearchParams({ code: row.code, label: `${tx('Promo code')} ${row.code}` }).toString()}`

const PromoCodeStats = () => {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [data, setData] = useState<PromoCodeStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('uses')
  const [showUnused, setShowUnused] = useState(true)
  const router = useRouter()
  const { changeActivePromoCode } = usePromoCodesSliceStore()

  // the edit page works on the code kept in the store, so load it first
  const openCode = async (id: string) => {
    try {
      const code = await API.get<PromoCode>(`${process.env.API_KEY}/shop/promotion-codes/${id}`)
      if (code) {
        changeActivePromoCode(code)
        router.push(URLPartsEnum.EditPromoCode)
      }
    } catch {
      /* the error toast comes from the API helper */
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    setData(await BackofficeAPI.getPromoCodeStats(from || undefined, to || undefined))
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = (data?.rows ?? []).filter(
      (row) => (!term || row.code.toLowerCase().includes(term)) && (showUnused || row.uses > 0)
    )
    const by: Record<SortKey, (a: PromoCodeStatsRow, b: PromoCodeStatsRow) => number> = {
      uses: (a, b) => b.uses - a.uses || b.saved - a.saved,
      saved: (a, b) => b.saved - a.saved,
      revenue: (a, b) => b.revenue - a.revenue,
      lastUsed: (a, b) => (b.lastUsed ?? '').localeCompare(a.lastUsed ?? ''),
      code: (a, b) => a.code.localeCompare(b.code),
    }
    return [...list].sort(by[sort])
  }, [data, query, sort, showUnused])

  const totals = data?.totals
  const header = (key: SortKey, label: string, right = true) => (
    <th className={`px-3 py-3 ${right ? 'text-right' : 'text-left'}`}>
      <button
        type="button"
        onClick={() => setSort(key)}
        className={`font-semibold uppercase ${sort === key ? 'text-purple-600 dark:text-purple-300' : ''}`}
      >
        {label}
        {sort === key ? ' ↓' : ''}
      </button>
    </th>
  )

  return (
    <div className="flex w-full flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tx('Promo code statistics')}</h1>
        <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          {tx(
            'How often each code was used, how much the customers saved with it and what those orders brought in. Cancelled and returned orders are not counted as uses. "Saved" is the discount the order got on its products; a customer with their own discount has it included.'
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="stats-from" className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
            {tx('From')}
          </label>
          <TextInput id="stats-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label htmlFor="stats-to" className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
            {tx('To')}
          </label>
          <TextInput id="stats-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        {(from || to) && (
          <Button color="gray" onClick={() => (setFrom(''), setTo(''))}>
            {tx('All time')}
          </Button>
        )}
        {loading && <Spinner size="md" />}
      </div>

      {totals && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile label={tx('Uses')} value={String(totals.uses)} hint={tx('{sold} of them sent to the customer', { sold: totals.sold })} />
          <Tile label={tx('Customers saved')} value={km(totals.saved)} />
          <Tile label={tx('Revenue of those orders')} value={km(totals.revenue)} hint={tx('Products after the discount, without delivery')} />
          <Tile
            label={tx('Codes used')}
            value={`${totals.usedCodes}`}
            hint={tx('{codes} codes in the list, {cancelled} cancelled orders with a code', {
              codes: totals.codes,
              cancelled: totals.cancelled,
            })}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          className="w-full sm:w-72"
          placeholder={tx('Search a code')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-enter-ignore
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={showUnused} onChange={(e) => setShowUnused(e.target.checked)} />
          {tx('Show codes nobody used')}
        </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[960px] text-sm text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-50 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              {header('code', tx('Code'), false)}
              <th className="px-3 py-3 text-left font-semibold uppercase">{tx('Discount')}</th>
              {header('uses', tx('Uses'))}
              {header('saved', tx('Saved'))}
              {header('revenue', tx('Revenue'))}
              <th className="px-3 py-3 text-right font-semibold uppercase">{tx('Average order')}</th>
              <th className="px-3 py-3 text-right font-semibold uppercase">{tx('Given / used')}</th>
              {header('lastUsed', tx('Last used'))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {rows.map((row) => (
              <tr key={row.id ?? `deleted-${row.code}`} className="align-top">
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.id ? (
                      <button
                        type="button"
                        onClick={() => openCode(row.id!)}
                        className="font-mono font-semibold text-purple-700 hover:underline dark:text-purple-300"
                      >
                        {row.code}
                      </button>
                    ) : (
                      <span className="font-mono font-semibold">{row.code}</span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATE_STYLE[row.state]}`}>
                      {tx(STATE_TEXT[row.state])}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {row.startsAt || row.endsAt ? `${date(row.startsAt)} – ${date(row.endsAt)}` : tx('Only on old orders')}
                    {row.categoryLimited && ` · ${tx('only some categories')}`}
                  </div>
                </td>
                <td className="px-3 py-3">{row.discountPercentage != null ? `${row.discountPercentage}%` : '—'}</td>
                <td className="px-3 py-3 text-right">
                  {row.uses > 0 ? (
                    <Link href={ordersLink(row)} className="text-purple-700 hover:underline dark:text-purple-300">
                      {row.uses}
                    </Link>
                  ) : (
                    0
                  )}
                  {row.cancelled > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tx('+{n} cancelled', { n: row.cancelled })}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-right font-medium">{km(row.saved)}</td>
                <td className="px-3 py-3 text-right">{km(row.revenue)}</td>
                <td className="px-3 py-3 text-right">{row.uses ? km(row.averageOrder) : '—'}</td>
                <td className="px-3 py-3 text-right">{row.id ? `${row.assigned} / ${row.redeemed}` : '—'}</td>
                <td className="px-3 py-3 text-right">{date(row.lastUsed)}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">
                  {tx('No promo codes in this period.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tx('"Given / used": how many customers got the code and how many of them used it. A click on the number of uses opens those orders.')}
      </p>
    </div>
  )
}

export default PromoCodeStats
