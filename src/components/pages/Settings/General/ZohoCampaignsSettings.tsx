'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Badge, Button, Label, Select, TextInput } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import SubscribersAPI from '@/services/subscibers'
import { ZohoStatus } from '@/services/backoffice'

export type ZohoForm = {
  listKey: string
  listName: string
  testListKey: string
  testListName: string
  fromEmail: string
  // every address a campaign may come from, and those confirmed in Zoho
  senders: string[]
  verifiedSenders: string[]
  fromName: string
  topicId: string
  contactLimit: string
  monthlyLimit: string
  disconnect: boolean
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const DEFAULT_ZOHO_FORM: ZohoForm = {
  listKey: '',
  listName: '',
  testListKey: '',
  testListName: '',
  fromEmail: 'aleksa.pejakovic@3dpartshop.com',
  senders: ['aleksa.pejakovic@3dpartshop.com', 'info@3dpartshop.com'],
  verifiedSenders: ['aleksa.pejakovic@3dpartshop.com'],
  fromName: '3D Part',
  topicId: '',
  contactLimit: '2000',
  monthlyLimit: '6000',
  disconnect: false,
}

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

export const readZohoForm = (stored: any): ZohoForm => {
  if (!stored) return DEFAULT_ZOHO_FORM
  const senders = Array.from(new Set([...list(stored.senders), ...(stored.fromEmail ? [stored.fromEmail] : [])]))
  return {
    ...DEFAULT_ZOHO_FORM,
    listKey: stored.listKey || '',
    listName: stored.listName || '',
    testListKey: stored.testListKey || '',
    testListName: stored.testListName || '',
    fromEmail: stored.fromEmail || DEFAULT_ZOHO_FORM.fromEmail,
    senders: senders.length ? senders : DEFAULT_ZOHO_FORM.senders,
    verifiedSenders: Array.isArray(stored.verifiedSenders) ? list(stored.verifiedSenders) : DEFAULT_ZOHO_FORM.verifiedSenders,
    fromName: stored.fromName || DEFAULT_ZOHO_FORM.fromName,
    topicId: stored.topicId || '',
    contactLimit: String(stored.contactLimit || DEFAULT_ZOHO_FORM.contactLimit),
    monthlyLimit: String(stored.monthlyLimit || DEFAULT_ZOHO_FORM.monthlyLimit),
  }
}

/** What the settings save keeps; the connection is set only by "Connect" in the API. */
export const zohoSettings = (form: ZohoForm) => ({
  listKey: form.listKey,
  listName: form.listName,
  testListKey: form.testListKey,
  testListName: form.testListName,
  fromEmail: form.fromEmail.trim(),
  senders: form.senders.map((email) => email.trim()).filter(Boolean),
  verifiedSenders: form.verifiedSenders.filter((email) => form.senders.includes(email)),
  fromName: form.fromName.trim(),
  contactLimit: Number(form.contactLimit) || 2000,
  monthlyLimit: Number(form.monthlyLimit) || 6000,
  ...(form.disconnect ? { disconnect: true } : {}),
})

/**
 * Zoho Campaigns: connected once with the code of a Zoho "Self Client"; the
 * code lasts 10 minutes, so it is typed here right after it is made. The
 * secrets go straight to the API and are never shown again.
 */
const ZohoCampaignsSettings: React.FC<{ value: ZohoForm; onChange: (next: ZohoForm) => void }> = ({
  value,
  onChange,
}) => {
  const [status, setStatus] = useState<ZohoStatus | null>(null)
  const [keys, setKeys] = useState({ clientId: '', clientSecret: '', code: '' })
  const [busy, setBusy] = useState<'connect' | 'check' | 'csv' | null>(null)
  const [check, setCheck] = useState<{ ok: boolean; message: string } | null>(null)
  const [newSender, setNewSender] = useState('')
  const set = (patch: Partial<ZohoForm>) => onChange({ ...value, ...patch })

  const load = () => BackofficeAPI.getZohoStatus().then(({ data }) => setStatus(data))
  useEffect(() => {
    load()
  }, [])

  const connect = async () => {
    setBusy('connect')
    const { data, error } = await BackofficeAPI.connectZoho({
      clientId: keys.clientId.trim(),
      clientSecret: keys.clientSecret.trim(),
      code: keys.code.trim(),
    })
    setBusy(null)
    if (!data) {
      if (!error) toast(tx('Zoho was not connected'), { type: 'error', autoClose: 8000 })
      return
    }
    setKeys({ clientId: '', clientSecret: '', code: '' })
    const testList = data.lists.find((item) => /test|proba/i.test(item.listName) && item.listKey !== data.listKey)
    set({
      listKey: data.listKey ?? '',
      listName: data.listName ?? '',
      ...(testList && !value.testListKey ? { testListKey: testList.listKey, testListName: testList.listName } : {}),
      disconnect: false,
    })
    setStatus(data)
    toast(tx('Zoho Campaigns is connected. Save the settings to keep the list and the sender.'), {
      type: 'success',
      autoClose: 5000,
    })
  }

  const checkConnection = async () => {
    setBusy('check')
    const { data, error } = await BackofficeAPI.checkZoho()
    setBusy(null)
    setCheck(data ? { ok: data.ok, message: data.message } : { ok: false, message: error ?? 'Zoho is not answering' })
    if (data?.ok) load()
  }

  // a reserve way in: the subscribers as a CSV for Zoho's own import
  const downloadCsv = async () => {
    setBusy('csv')
    try {
      const emails: string[] = []
      for (let offset = 0; ; offset += 100) {
        const data = await SubscribersAPI.getSubscribers({ field: 'createdAt', order: 'ASC' }, { offset, limit: 100 })
        if (!data) throw new Error('fetch failed')
        emails.push(...data.rows.map((row) => row.email))
        if (emails.length >= data.count || data.rows.length === 0) break
      }
      const unique = Array.from(new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)))
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([['Contact Email', ...unique].join('\r\n')], { type: 'text/csv;charset=utf-8' }))
      link.download = `pretplatnici-za-zoho-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch {
      toast(tx('Could not load the subscribers'), { type: 'error', autoClose: 4000 })
    }
    setBusy(null)
  }

  const addSender = () => {
    const email = newSender.trim().toLowerCase()
    if (!EMAIL.test(email) || value.senders.includes(email)) return
    set({ senders: [...value.senders, email] })
    setNewSender('')
  }
  const removeSender = (email: string) => {
    const senders = value.senders.filter((item) => item !== email)
    const verifiedSenders = value.verifiedSenders.filter((item) => item !== email)
    set({
      senders,
      verifiedSenders,
      fromEmail: value.fromEmail === email ? verifiedSenders[0] ?? '' : value.fromEmail,
    })
  }
  const toggleVerified = (email: string) => {
    const on = value.verifiedSenders.includes(email)
    const verifiedSenders = on ? value.verifiedSenders.filter((item) => item !== email) : [...value.verifiedSenders, email]
    set({
      verifiedSenders,
      // the default sender has to be confirmed
      fromEmail: on && value.fromEmail === email ? verifiedSenders[0] ?? '' : value.fromEmail,
    })
  }

  const connected = !!status?.connected && !value.disconnect
  const pickList = (key: 'listKey' | 'testListKey', nameKey: 'listName' | 'testListName', listKey: string) => {
    const found = status?.lists.find((item) => item.listKey === listKey)
    set({ [key]: listKey, [nameKey]: found?.listName ?? '' } as Partial<ZohoForm>)
  }

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-wrap items-center gap-3 rounded-lg p-3 text-sm ${
          connected && !status?.error
            ? 'bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100'
            : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        <span className="flex-1">
          {connected
            ? tx('Connected to Zoho Campaigns.')
            : value.disconnect
            ? tx('Zoho is disconnected when you save.')
            : tx('Not connected.')}
          {status?.error && <span className="ml-2 text-red-600 dark:text-red-300">{tx(status.error)}</span>}
        </span>
        {status?.connected && (
          <Button size="xs" color="gray" isProcessing={busy === 'check'} disabled={!!busy} onClick={checkConnection}>
            {tx('Check the connection')}
          </Button>
        )}
      </div>
      {check && (
        <p className={`text-sm ${check.ok ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
          {tx(check.message)}
        </p>
      )}

      <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white">{connected ? tx('Connect again') : tx('Connect')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tx('In api-console.zoho.eu → Self Client: copy the Client ID and Client Secret, generate a code with the scopes ZohoCampaigns.campaign.ALL,ZohoCampaigns.contact.ALL and connect within 10 minutes. The values are sent only to the server and never shown again.')}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label htmlFor="zh-id" value="Client ID" />
            <TextInput id="zh-id" autoComplete="off" value={keys.clientId} onChange={(e) => setKeys({ ...keys, clientId: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="zh-secret" value="Client Secret" />
            <TextInput id="zh-secret" type="password" autoComplete="new-password" value={keys.clientSecret} onChange={(e) => setKeys({ ...keys, clientSecret: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="zh-code" value={tx('Code')} />
            <TextInput id="zh-code" type="password" autoComplete="off" value={keys.code} onChange={(e) => setKeys({ ...keys, code: e.target.value })} />
          </div>
        </div>
        <Button
          size="sm"
          color="purple"
          isProcessing={busy === 'connect'}
          disabled={!!busy || !keys.clientId.trim() || !keys.clientSecret.trim() || !keys.code.trim()}
          onClick={connect}
        >
          {tx('Connect')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="zh-list" value={tx('Newsletter list in Zoho')} />
          <Select id="zh-list" value={value.listKey} onChange={(e) => pickList('listKey', 'listName', e.target.value)}>
            <option value="">{value.listName || '—'}</option>
            {status?.lists
              .filter((item) => item.listKey !== value.listKey || true)
              .map((item) => (
                <option key={item.listKey} value={item.listKey}>
                  {item.listName} ({item.contacts})
                </option>
              ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="zh-test" value={tx('Test list (only your own address)')} />
          <Select id="zh-test" value={value.testListKey} onChange={(e) => pickList('testListKey', 'testListName', e.target.value)}>
            <option value="">{value.testListName || '—'}</option>
            {status?.lists
              .filter((item) => item.listKey !== value.listKey)
              .map((item) => (
                <option key={item.listKey} value={item.listKey}>
                  {item.listName} ({item.contacts})
                </option>
              ))}
          </Select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {tx('"Send a test to me" goes only to this list. Make it in Zoho, e.g. "3DPart test".')}
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label value={tx('Senders')} />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tx('Zoho shows its senders only in its own settings (Settings → Sender addresses); mark here the ones Zoho shows as Verified. Only a confirmed sender can be the default or send a campaign.')}
          </p>
          <div className="space-y-1">
            {value.senders.map((email) => {
              const verified = value.verifiedSenders.includes(email)
              return (
                <div key={email} className="flex flex-wrap items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
                  <input
                    type="radio"
                    name="zh-default-sender"
                    disabled={!verified}
                    checked={value.fromEmail === email}
                    onChange={() => set({ fromEmail: email })}
                    title={verified ? tx('Default sender') : tx('Not confirmed in Zoho yet')}
                  />
                  <span className="min-w-[220px] flex-1">{email}</span>
                  <Badge color={verified ? 'success' : 'warning'}>{verified ? tx('Verified') : tx('Waits for confirmation')}</Badge>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" checked={verified} onChange={() => toggleVerified(email)} />
                    {tx('Verified in Zoho')}
                  </label>
                  {value.fromEmail === email && <span className="text-xs text-purple-600 dark:text-purple-300">{tx('default')}</span>}
                  {value.senders.length > 1 && (
                    <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => removeSender(email)}>
                      {tx('Remove')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <TextInput
              type="email"
              className="flex-1"
              placeholder="ime@3dpartshop.com"
              value={newSender}
              onChange={(e) => setNewSender(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSender()
                }
              }}
            />
            <Button size="sm" color="gray" disabled={!EMAIL.test(newSender.trim())} onClick={addSender}>
              {tx('Add sender')}
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="zh-name" value={tx('Sender name')} />
          <TextInput id="zh-name" value={value.fromName} onChange={(e) => set({ fromName: e.target.value })} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {tx('Goes with every campaign. Not saved in Zoho, whose own sender name field does not take digits.')}
          </p>
        </div>
        <div>
          <Label htmlFor="zh-cl" value={tx('Contact limit of the Zoho plan')} />
          <TextInput id="zh-cl" type="number" value={value.contactLimit} onChange={(e) => set({ contactLimit: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="zh-ml" value={tx('Mails a month in the Zoho plan')} />
          <TextInput id="zh-ml" type="number" value={value.monthlyLimit} onChange={(e) => set({ monthlyLimit: e.target.value })} />
        </div>
        <div className="flex flex-wrap items-end gap-3 md:col-span-2">
          <Button size="xs" color="gray" isProcessing={busy === 'csv'} disabled={!!busy} onClick={downloadCsv}>
            {tx('Download subscribers (CSV, reserve)')}
          </Button>
          {status?.connected && (
            <Button size="xs" color="gray" onClick={() => set({ disconnect: true })}>
              {tx('Disconnect Zoho')}
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tx('Save the settings after changing the lists, the senders or the limits. Subscribers are synced on Subscribers → Sync with Zoho.')}
      </p>
    </div>
  )
}

export default ZohoCampaignsSettings
