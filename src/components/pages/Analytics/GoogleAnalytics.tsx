'use client'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Button, Label, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'
import { GaNotConnected, GaOverview } from '@/services/backoffice'
import { Loader } from '@/components/common'
import { URLPartsEnum } from '@/shared/enums'

const isoDay = (date: Date) => date.toISOString().slice(0, 10)
const number = (value: number) => value.toLocaleString('de-DE')
const money = (value: number, currency: string) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency === 'BAM' ? 'KM' : currency}`
const percent = (value: number) => `${Math.round(value * 100)}%`
const th = 'px-3 py-2 text-left text-xs uppercase text-gray-500 dark:text-gray-400'
const td = 'px-3 py-2'
const num = 'px-3 py-2 text-right whitespace-nowrap'

const Tile: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
)

const Box: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`min-w-0 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className ?? ''}`}>
    <h3 className="p-3 font-semibold text-gray-900 dark:text-white">{title}</h3>
    <div className="max-h-[420px] overflow-auto">{children}</div>
  </div>
)

const Empty = () => <p className="px-3 pb-3 text-sm text-gray-500 dark:text-gray-400">{tx('Nothing counted in this period yet.')}</p>

/** Two columns of figures under a name, with a bar for the share of the first. */
const Rows: React.FC<{ rows: { name: string; a: number; b: number }[]; head: [string, string, string] }> = ({ rows, head }) => {
  if (rows.length === 0) return <Empty />
  const max = Math.max(...rows.map((row) => row.a), 1)
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className={th}>{head[0]}</th>
          <th className={`${th} text-right`}>{head[1]}</th>
          <th className={`${th} text-right`}>{head[2]}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
        {rows.map((row) => (
          <tr key={row.name}>
            <td className={td}>
              <div className="break-all">{row.name || '(not set)'}</div>
              <div className="mt-1 h-1 rounded bg-purple-500/70" style={{ width: `${(row.a / max) * 100}%` }} />
            </td>
            <td className={num}>{number(row.a)}</td>
            <td className={num}>{number(row.b)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Users per day as bars; the day and its figures on hover. */
const DaysChart: React.FC<{ days: GaOverview['days'] }> = ({ days }) => {
  if (days.length === 0) return <Empty />
  const max = Math.max(...days.map((day) => day.activeUsers), 1)
  return (
    <div className="px-3 pb-3">
      <div className="flex h-40 items-end gap-[2px]">
        {days.map((day) => (
          <div
            key={day.date}
            className="flex-1 rounded-t bg-purple-500/80 hover:bg-purple-600"
            style={{ height: `${Math.max(2, (day.activeUsers / max) * 100)}%` }}
            title={`${day.date}: ${tx('{users} users, {sessions} sessions, {views} page views', {
              users: day.activeUsers,
              sessions: day.sessions,
              views: day.screenPageViews,
            })}`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{days[0].date}</span>
        <span>{days[days.length - 1].date}</span>
      </div>
    </div>
  )
}

/** What to do when Google Analytics is not connected yet. */
const NotConnected: React.FC<{ missing: GaNotConnected['missing'] }> = ({ missing }) => (
  <div className="max-w-3xl rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800" data-testid="ga-not-connected">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tx('Google Analytics is not connected')}</h3>
    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
      {missing.includes('propertyId') && missing.includes('serviceAccount')
        ? tx('The property ID and the service account key are missing.')
        : missing.includes('propertyId')
          ? tx('The property ID is missing.')
          : tx('The service account key is missing.')}
    </p>
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
      <li>{tx('Google Cloud Console (console.cloud.google.com): pick or create a project, then APIs & Services → Library → Google Analytics Data API → Enable.')}</li>
      <li>{tx('IAM & Admin → Service Accounts → Create service account (no roles needed). Open it → Keys → Add key → Create new key → JSON; a .json file is downloaded.')}</li>
      <li>{tx('Google Analytics → Admin → Property access management → + → add the service account e-mail (…@….iam.gserviceaccount.com) with the Viewer role.')}</li>
      <li>{tx('Google Analytics → Admin → Property details: copy the Property ID (a number).')}</li>
      <li>{tx('Here: Settings → Google Analytics: paste the property ID, load the JSON file, Save Settings, then Check the connection.')}</li>
    </ol>
    <div className="mt-5 flex flex-wrap gap-2">
      <Button size="sm" href={`${URLPartsEnum.SettingsGeneral}?tab=google-analytics`}>
        {tx('Open the settings')}
      </Button>
      <Button size="sm" color="gray" href={URLPartsEnum.Guide}>
        {tx('Guide')}
      </Button>
    </div>
  </div>
)

const GoogleAnalytics = () => {
  const today = new Date()
  const [from, setFrom] = useState(isoDay(new Date(today.getTime() - 27 * 86400000)))
  const [to, setTo] = useState(isoDay(today))
  const [data, setData] = useState<GaOverview | GaNotConnected | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (fresh = false) => {
      setLoading(true)
      const result = await BackofficeAPI.getGoogleAnalytics({ from, to, fresh })
      setData(result.data)
      setError(result.data ? null : result.error ?? 'Google Analytics could not be read')
      setLoading(false)
    },
    [from, to]
  )

  useEffect(() => {
    load()
  }, [load])

  const report = data && data.connected ? data : null

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full sm:w-auto mr-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{tx('Google Analytics')}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {tx('Visits of the site as Google Analytics counts them. The figures are kept for 10 minutes.')}
          </p>
        </div>
        <div className="w-[calc(50%-0.5rem)] sm:w-auto [&_input]:w-full">
          <Label htmlFor="ga-from" value={tx('From')} />
          <TextInput id="ga-from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-[calc(50%-0.5rem)] sm:w-auto [&_input]:w-full">
          <Label htmlFor="ga-to" value={tx('To')} />
          <TextInput id="ga-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
        </div>
        {report && (
          <Button color="gray" onClick={() => load(true)}>
            {tx('Refresh')}
          </Button>
        )}
      </div>

      {loading && <Loader />}

      {!loading && error && (
        <Alert color="failure">
          <p className="font-medium">{tx('Google Analytics could not be read')}</p>
          <p className="mt-1">{tx(error)}</p>
        </Alert>
      )}

      {!loading && data && !data.connected && <NotConnected missing={data.missing} />}

      {!loading && report && (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Tile label={tx('Users')} value={number(report.totals.activeUsers)} hint={tx('{count} new', { count: number(report.totals.newUsers) })} />
            <Tile label={tx('Sessions')} value={number(report.totals.sessions)} hint={tx('Engaged: {rate}', { rate: percent(report.totals.engagementRate) })} />
            <Tile label={tx('Page views')} value={number(report.totals.screenPageViews)} />
            {report.ecommerce ? (
              <Tile
                label={tx('Purchases')}
                value={number(report.ecommerce.purchases)}
                hint={tx('Revenue {revenue}', { revenue: money(report.ecommerce.revenue, report.currency) })}
              />
            ) : (
              <Tile label={tx('Purchases')} value="—" hint={tx('No e-commerce data in this property')} />
            )}
          </div>

          <Box title={tx('Users per day')}>
            <DaysChart days={report.days} />
          </Box>

          <div className="grid gap-4 lg:grid-cols-2">
            <Box title={tx('Top pages')} className="lg:col-span-2">
              {report.pages.length === 0 ? (
                <Empty />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className={th}>{tx('Page')}</th>
                      <th className={`${th} text-right`}>{tx('Page views')}</th>
                      <th className={`${th} text-right`}>{tx('Users')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
                    {report.pages.map((page) => (
                      <tr key={`${page.pagePath}|${page.pageTitle}`}>
                        <td className={td}>
                          <div className="font-medium">{page.pageTitle || page.pagePath}</div>
                          <div className="break-all text-xs text-gray-500 dark:text-gray-400">{page.pagePath}</div>
                        </td>
                        <td className={num}>{number(page.screenPageViews)}</td>
                        <td className={num}>{number(page.activeUsers)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Box>
            <Box title={tx('Traffic channels')}>
              <Rows
                head={[tx('Channel'), tx('Sessions'), tx('Users')]}
                rows={report.channels.map((row) => ({ name: row.sessionDefaultChannelGroup, a: row.sessions, b: row.activeUsers }))}
              />
            </Box>
            <Box title={tx('Traffic sources')}>
              <Rows
                head={[tx('Source / medium'), tx('Sessions'), tx('Users')]}
                rows={report.sources.map((row) => ({ name: row.sessionSourceMedium, a: row.sessions, b: row.activeUsers }))}
              />
            </Box>
            <Box title={tx('Devices')}>
              <Rows
                head={[tx('Device'), tx('Sessions'), tx('Users')]}
                rows={report.devices.map((row) => ({ name: tx(row.deviceCategory), a: row.sessions, b: row.activeUsers }))}
              />
            </Box>
            <Box title={tx('Products bought (GA)')}>
              {!report.ecommerce || report.ecommerce.items.length === 0 ? (
                <Empty />
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className={th}>{tx('Product')}</th>
                      <th className={`${th} text-right`}>{tx('Pieces')}</th>
                      <th className={`${th} text-right`}>{tx('Revenue')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
                    {report.ecommerce.items.map((item) => (
                      <tr key={item.itemName}>
                        <td className={td}>{item.itemName}</td>
                        <td className={num}>{number(item.itemsPurchased)}</td>
                        <td className={num}>{money(item.itemRevenue, report.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Box>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tx('Property {id}, read at {time}. The figures of Google Analytics can differ from the orders of the shop, e.g. because of ad blockers or declined cookies.', {
              id: report.propertyId,
              time: new Date(report.cachedAt).toLocaleString('de-DE'),
            })}
          </p>
        </>
      )}
    </div>
  )
}

export default GoogleAnalytics
