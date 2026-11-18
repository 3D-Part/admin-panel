'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Label, Select, TextInput } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { ZohoStatus } from '@/services/backoffice'

export type ZohoForm = {
  listKey: string
  listName: string
  fromEmail: string
  // every address a campaign may come from (confirmed senders in Zoho)
  senders: string[]
  fromName: string
  topicId: string
  disconnect: boolean
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const DEFAULT_ZOHO_FORM: ZohoForm = {
  listKey: '',
  listName: '',
  fromEmail: 'info@3dpartshop.com',
  senders: ['info@3dpartshop.com'],
  fromName: '3D Part',
  topicId: '',
  disconnect: false,
}

export const readZohoForm = (stored: any): ZohoForm => ({
  ...DEFAULT_ZOHO_FORM,
  listKey: stored?.listKey || '',
  listName: stored?.listName || '',
  fromEmail: stored?.fromEmail || DEFAULT_ZOHO_FORM.fromEmail,
  senders: Array.from(
    new Set([
      stored?.fromEmail || DEFAULT_ZOHO_FORM.fromEmail,
      ...(Array.isArray(stored?.senders) ? stored.senders : []),
    ])
  ),
  fromName: stored?.fromName || DEFAULT_ZOHO_FORM.fromName,
  topicId: stored?.topicId || '',
})

/** What the settings save keeps: the secrets are set only by "Connect" in the API. */
export const zohoSettings = (form: ZohoForm) => ({
  listKey: form.listKey,
  listName: form.listName,
  fromEmail: form.fromEmail.trim(),
  senders: form.senders.map((email) => email.trim()).filter(Boolean),
  fromName: form.fromName.trim(),
  topicId: form.topicId.trim(),
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
  const [busy, setBusy] = useState<'connect' | 'sync' | null>(null)
  const [newSender, setNewSender] = useState('')
  const addSender = () => {
    const email = newSender.trim().toLowerCase()
    if (!EMAIL.test(email) || value.senders.includes(email)) return
    onChange({ ...value, senders: [...value.senders, email] })
    setNewSender('')
  }
  const removeSender = (email: string) => {
    const senders = value.senders.filter((item) => item !== email)
    onChange({ ...value, senders, fromEmail: value.fromEmail === email ? senders[0] ?? '' : value.fromEmail })
  }
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
      toast(error ? tx(error) : tx('Zoho was not connected'), { type: 'error', autoClose: 8000 })
      return
    }
    setKeys({ clientId: '', clientSecret: '', code: '' })
    set({ listKey: data.listKey ?? '', listName: data.listName ?? '', disconnect: false })
    setStatus(data)
    toast(tx('Zoho Campaigns is connected'), { type: 'success', autoClose: 3000 })
  }

  const sync = async () => {
    setBusy('sync')
    const { data, error } = await BackofficeAPI.syncZohoSubscribers()
    setBusy(null)
    if (!data) {
      toast(error ? tx(error) : tx('The subscribers were not sent'), { type: 'error', autoClose: 6000 })
      return
    }
    toast(tx('{added} of {total} subscribers sent to Zoho', { added: data.added, total: data.total }), {
      type: data.failed ? 'warning' : 'success',
      autoClose: 5000,
    })
    load()
  }

  const connected = !!status?.connected && !value.disconnect

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg p-3 text-sm ${
          connected
            ? 'bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100'
            : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
        }`}
      >
        {connected
          ? tx('Connected to Zoho Campaigns.')
          : value.disconnect
          ? tx('Zoho is disconnected when you save.')
          : tx('Not connected.')}
        {status?.error && <span className="ml-2 text-red-600 dark:text-red-300">{tx(status.error)}</span>}
      </div>

      <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white">{connected ? tx('Connect again') : tx('Connect')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tx('In api-console.zoho.eu → Self Client: copy the Client ID and Client Secret, generate a code with the scopes ZohoCampaigns.campaign.ALL,ZohoCampaigns.contact.ALL,ZohoCampaigns.reports.READ and connect within 10 minutes. The values are sent only to the server and never shown again.')}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label htmlFor="zh-id" value="Client ID" />
            <TextInput id="zh-id" autoComplete="off" value={keys.clientId} onChange={(e) => setKeys({ ...keys, clientId: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="zh-secret" value="Client Secret" />
            <TextInput
              id="zh-secret"
              type="password"
              autoComplete="new-password"
              value={keys.clientSecret}
              onChange={(e) => setKeys({ ...keys, clientSecret: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="zh-code" value={tx('Code')} />
            <TextInput
              id="zh-code"
              type="password"
              autoComplete="off"
              value={keys.code}
              onChange={(e) => setKeys({ ...keys, code: e.target.value })}
            />
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

      {connected && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="zh-list" value={tx('Newsletter list in Zoho')} />
            <Select
              id="zh-list"
              value={value.listKey}
              onChange={(e) => {
                const list = status?.lists.find((item) => item.listKey === e.target.value)
                set({ listKey: e.target.value, listName: list?.listName ?? '' })
              }}
            >
              <option value="">—</option>
              {status?.lists.map((list) => (
                <option key={list.listKey} value={list.listKey}>
                  {list.listName} ({list.contacts})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button size="sm" color="gray" isProcessing={busy === 'sync'} disabled={!!busy || !value.listKey} onClick={sync}>
              {tx('Send all subscribers to Zoho')}
            </Button>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label value={tx('Senders')} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tx('The addresses a campaign may come from; the sender is picked on each campaign. Each one has to be a confirmed sender in Zoho Campaigns (Settings → Sender addresses).')}
            </p>
            <div className="space-y-1">
              {value.senders.map((email) => (
                <label key={email} className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
                  <input
                    type="radio"
                    name="zh-default-sender"
                    checked={value.fromEmail === email}
                    onChange={() => set({ fromEmail: email })}
                  />
                  <span className="flex-1">{email}</span>
                  {value.fromEmail === email && (
                    <span className="text-xs text-purple-600 dark:text-purple-300">{tx('default')}</span>
                  )}
                  {value.senders.length > 1 && (
                    <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => removeSender(email)}>
                      {tx('Remove')}
                    </button>
                  )}
                </label>
              ))}
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
          </div>
          <div>
            <Label htmlFor="zh-topic" value={tx('Topic ID (only if Zoho asks for it)')} />
            <TextInput id="zh-topic" value={value.topicId} onChange={(e) => set({ topicId: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button size="xs" color="gray" onClick={() => set({ disconnect: true })}>
              {tx('Disconnect Zoho')}
            </Button>
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tx('New subscribers of the site go onto the list by themselves. Save the settings after changing the list or the sender.')}
      </p>
    </div>
  )
}

export default ZohoCampaignsSettings
