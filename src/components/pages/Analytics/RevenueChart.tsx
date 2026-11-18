'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Day = { date: string; orders: number; revenue: number }
type Unit = 'day' | 'week' | 'month'

// thousands grouped, two decimals: 278.804,90 KM
const money = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`
const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Up to about six weeks by day, up to about seven months by week, then by month
const unitFor = (days: number): Unit => (days <= 45 ? 'day' : days <= 210 ? 'week' : 'month')

const startOf = (date: Date, unit: Unit) => {
  if (unit === 'day') return date
  if (unit === 'month') return new Date(date.getFullYear(), date.getMonth(), 1)
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return monday
}

const label = (date: Date, unit: Unit) =>
  unit === 'month'
    ? `${pad(date.getMonth() + 1)}.${date.getFullYear()}`
    : `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.`

const fullLabel = (date: Date, unit: Unit) => {
  const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
  if (unit === 'day') return day
  if (unit === 'week') return tx('Week from {date}', { date: day })
  return `${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

// 1, 2, 2.5 or 5 times a power of ten, so the axis reads in round numbers
const niceStep = (raw: number) => {
  const power = Math.pow(10, Math.floor(Math.log10(raw)))
  return [1, 2, 2.5, 5, 10].map((n) => n * power).find((n) => n >= raw) ?? raw
}

/**
 * Revenue over the chosen period as bars. Every day of the period is there,
 * also the days without sales, grouped by day, week or month depending on how
 * long the period is (the buttons override it). Hover or focus a bar for the
 * revenue and the orders of that day, week or month.
 */
const RevenueChart: React.FC<{ days: Day[]; from: string; to: string }> = ({
  days,
  from,
  to,
}) => {
  const span = Math.max(1, Math.round((parse(to).getTime() - parse(from).getTime()) / 86400000) + 1)
  const [unit, setUnit] = useState<Unit>(unitFor(span))
  // a new period picks its own grouping again
  useEffect(() => setUnit(unitFor(span)), [span])

  const buckets = useMemo(() => {
    const byDate = new Map(days.map((day) => [day.date, day]))
    const list: { key: string; start: Date; revenue: number; orders: number }[] = []
    const end = parse(to)
    for (let d = parse(from); d <= end; d.setDate(d.getDate() + 1)) {
      const start = startOf(new Date(d), unit)
      const key = iso(start)
      let bucket = list[list.length - 1]
      if (!bucket || bucket.key !== key) {
        bucket = { key, start, revenue: 0, orders: 0 }
        list.push(bucket)
      }
      const day = byDate.get(iso(d))
      if (day) {
        bucket.revenue += day.revenue
        bucket.orders += day.orders
      }
    }
    return list
  }, [days, from, to, unit])

  const max = Math.max(0, ...buckets.map((b) => b.revenue))
  const step = niceStep(Math.max(max, 100) / 4)
  const top = Math.max(step, Math.ceil(max / step) * step)
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step)
  // Label every bar when it fits. By day a label is just the day number (the
  // full date only on the first bar and on the 1st), so it is short; wider
  // labels (week, month) need more room. On a narrow screen labels thin out.
  const plotRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = plotRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const labelWidth = unit === 'day' ? 22 : 46
  const every = width
    ? Math.max(1, Math.ceil((buckets.length * labelWidth) / width))
    : 1
  const barLabel = (start: Date, index: number) =>
    unit !== 'day' || index === 0 || start.getDate() === 1
      ? label(start, unit)
      : String(start.getDate())
  const total = buckets.reduce((sum, b) => sum + b.revenue, 0)
  const orders = buckets.reduce((sum, b) => sum + b.orders, 0)

  const units: { id: Unit; name: string }[] = [
    { id: 'day', name: tx('By day') },
    { id: 'week', name: tx('By week') },
    { id: 'month', name: tx('By month') },
  ]

  return (
    <section
      id="revenue-chart"
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {tx('Revenue')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tx('{total} in {orders} orders · products after discounts', {
              total: money(total),
              orders,
            })}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label={tx('Group the chart')}
          className="inline-flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-600"
        >
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              role="radio"
              aria-checked={unit === u.id}
              onClick={() => setUnit(u.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                unit === u.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {u.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {/* y axis */}
        <div className="relative h-56 w-14 shrink-0 text-right text-[11px] text-gray-500 dark:text-gray-400">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0"
              style={{ bottom: `${(tick / top) * 100}%`, transform: 'translateY(50%)' }}
            >
              {tick >= 1000 ? `${tick / 1000}k` : tick}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {/* plot */}
          <div ref={plotRef} className="relative h-56">
            {ticks.map((tick) => (
              <div
                key={tick}
                aria-hidden
                className={`absolute inset-x-0 border-t ${
                  tick === 0
                    ? 'border-gray-300 dark:border-gray-600'
                    : 'border-dashed border-gray-200 dark:border-gray-700'
                }`}
                style={{ bottom: `${(tick / top) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {buckets.map((bucket, index) => {
                const height = (bucket.revenue / top) * 100
                const edge =
                  index < 2 ? 'left-0' : index > buckets.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                const text = `${fullLabel(bucket.start, unit)}: ${money(bucket.revenue)}, ${bucket.orders} ${tx('orders')}`
                return (
                  <div
                    key={bucket.key}
                    tabIndex={0}
                    aria-label={text}
                    className="group relative flex h-full min-w-[4px] flex-1 items-end focus:outline-none"
                  >
                    <div
                      className="w-full rounded-t-[4px] bg-purple-500 transition-colors group-hover:bg-purple-400 group-focus:bg-purple-400"
                      style={{ height: `${height}%`, minHeight: bucket.revenue > 0 ? 2 : 0 }}
                    />
                    <div
                      role="tooltip"
                      className={`pointer-events-none absolute z-10 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus:block dark:bg-gray-700 ${edge}`}
                      style={{ bottom: `calc(${Math.min(height, 85)}% + 6px)` }}
                    >
                      <span className="block font-medium">{fullLabel(bucket.start, unit)}</span>
                      {money(bucket.revenue)} · {bucket.orders} {tx('orders')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* x axis */}
          <div className="mt-1 flex gap-[2px] text-[11px] text-gray-500 dark:text-gray-400">
            {buckets.map((bucket, index) => (
              <div key={bucket.key} className="relative min-w-[4px] flex-1">
                {index % every === 0 && (
                  <span className="absolute left-0 whitespace-nowrap">
                    {barLabel(bucket.start, index)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
    </section>
  )
}

export default RevenueChart
