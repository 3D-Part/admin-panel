'use client'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useState } from 'react'
import { Button, TextInput } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { ZohoSummary as Summary } from '@/services/backoffice'
import { useSubscribersSliceStore } from '@/store/store'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone = '' }) => (
  <div className="min-w-[110px]">
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-lg font-semibold text-gray-900 dark:text-white ${tone}`}>{value}</p>
  </div>
)

/**
 * The newsletter at a glance: how many subscribers, where they stand in
 * Zoho, and how much of the Zoho plan is used. Adding one subscriber by hand
 * and syncing everyone with Zoho happen here.
 */
const ZohoSummary: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'add' | 'sync' | null>(null)
  const { fetchSubscribers, currentPage, itemsPerPage } = useSubscribersSliceStore()

  const refresh = useCallback(() => {
    BackofficeAPI.getZohoSummary().then(({ data }) => setSummary(data))
    fetchSubscribers({ offset: (currentPage - 1) * itemsPerPage, limit: itemsPerPage })
  }, [fetchSubscribers, currentPage, itemsPerPage])

  useEffect(() => {
    BackofficeAPI.getZohoSummary().then(({ data }) => setSummary(data))
  }, [])

  const add = async () => {
    setBusy('add')
    const { data, error } = await BackofficeAPI.addZohoSubscriber(email.trim())
    setBusy(null)
    if (!data) {
      if (!error) toast(tx('The subscriber was not added'), { type: 'error', autoClose: 6000 })
      return
    }
    setEmail('')
    toast(
      data.zohoStatus === 'in_list'
        ? tx('Added and in the Zoho list')
        : data.zohoStatus === 'pending'
          ? tx('Added; Zoho waits for the confirmation')
          : data.zohoStatus === 'error'
            ? tx('Added here, but Zoho did not take it (see the Zoho column)')
            : tx('Added; Zoho is not connected'),
      { type: data.zohoStatus === 'error' ? 'warning' : 'success', autoClose: 4000 }
    )
    refresh()
  }

  const sync = async () => {
    setBusy('sync')
    const { data, error } = await BackofficeAPI.syncZoho()
    setBusy(null)
    if (!data) {
      if (!error) toast(tx('The sync did not finish'), { type: 'error', autoClose: 7000 })
      return
    }
    toast(
      tx('Sync done: {inList} in the list, {added} added, {pending} wait for confirmation, {unsubscribed} unsubscribed, {errors} errors', {
        inList: data.inList,
        added: data.added,
        pending: data.pending,
        unsubscribed: data.unsubscribed,
        errors: data.errors,
      }),
      { type: data.errors ? 'warning' : 'success', autoClose: 8000 }
    )
    refresh()
  }

  const contacts = summary?.zohoContacts ?? summary?.inList ?? 0
  const near = (used: number, limit: number) => (used >= limit * 0.9 ? 'text-red-600 dark:text-red-400' : '')

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {summary && (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat label={tx('Subscribers')} value={summary.total} />
          <Stat label={tx('In Zoho')} value={summary.inList} tone="text-green-700 dark:text-green-300" />
          {summary.pending > 0 && <Stat label={tx('Wait for confirmation')} value={summary.pending} />}
          <Stat label={tx('Unsubscribed')} value={summary.unsubscribed} />
          <Stat label={tx('Errors')} value={summary.errors} tone={summary.errors ? 'text-red-600 dark:text-red-400' : ''} />
          {summary.notSynced > 0 && <Stat label={tx('Not synced')} value={summary.notSynced} />}
          <Stat
            label={tx('Zoho contacts / limit')}
            value={`${contacts} / ${summary.contactLimit}`}
            tone={near(contacts, summary.contactLimit)}
          />
          <Stat
            label={tx('Mails this month / limit')}
            value={`${summary.sentThisMonth} / ${summary.monthlyLimit}`}
            tone={near(summary.sentThisMonth, summary.monthlyLimit)}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <TextInput
          type="email"
          sizing="sm"
          className="w-64"
          placeholder={tx('New subscriber e-mail')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && EMAIL.test(email.trim()) && !busy && add()}
        />
        <Button size="sm" color="purple" isProcessing={busy === 'add'} disabled={!!busy || !EMAIL.test(email.trim())} onClick={add}>
          {tx('Add subscriber')}
        </Button>
        <Button size="sm" color="gray" isProcessing={busy === 'sync'} disabled={!!busy} onClick={sync}>
          {tx('Sync with Zoho')}
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {tx('Sync puts everyone who is not in Zoho onto the list and brings the unsubscribes from Zoho back here.')}
        </span>
      </div>
    </div>
  )
}

export default ZohoSummary
