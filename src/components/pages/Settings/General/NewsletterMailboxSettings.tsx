'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'

export type MailboxForm = {
  host: string
  port: string
  user: string
  fromName: string
  password: string
  hasPassword: boolean
  clearPassword: boolean
  // recipients in Bcc of one draft (the order e-mails mailbox only)
  perDraft?: string
}

export const DEFAULT_MAILBOX_FORM: MailboxForm = {
  // the shop's mail is at Zoho (EU)
  host: 'imap.zoho.eu',
  port: '993',
  user: '',
  fromName: '3D Part',
  password: '',
  hasPassword: false,
  clearPassword: false,
}

// the mailbox of the e-mails to the customers who ordered; the address is not final
export const DEFAULT_ORDER_MAILBOX_FORM: MailboxForm = {
  ...DEFAULT_MAILBOX_FORM,
  user: 'ponude@3dpartshop.com',
  perDraft: '100',
}

export const readMailboxForm = (stored: any, defaults: MailboxForm = DEFAULT_MAILBOX_FORM): MailboxForm => ({
  ...defaults,
  host: stored?.host || defaults.host,
  port: String(stored?.port || defaults.port),
  user: stored?.user || defaults.user,
  fromName: stored?.fromName || defaults.fromName,
  hasPassword: !!stored?.hasPassword,
  ...(defaults.perDraft !== undefined ? { perDraft: String(stored?.perDraft || defaults.perDraft) } : {}),
})

/** What goes into the settings: the password only when a new one is typed. */
export const mailboxSettings = (form: MailboxForm) => ({
  host: form.host.trim(),
  port: Number(form.port) || 993,
  user: form.user.trim(),
  fromName: form.fromName.trim(),
  ...(form.perDraft !== undefined ? { perDraft: Math.min(500, Math.max(1, Number(form.perDraft) || 100)) } : {}),
  ...(form.password ? { password: form.password } : {}),
  ...(form.clearPassword ? { clearPassword: true } : {}),
})

const NewsletterMailboxSettings: React.FC<{
  value: MailboxForm
  onChange: (next: MailboxForm) => void
  // which mailbox the check logs in to
  kind?: 'newsletter' | 'order'
}> = ({ value, onChange, kind = 'newsletter' }) => {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (patch: Partial<MailboxForm>) => onChange({ ...value, ...patch })
  const hasPassword = value.hasPassword && !value.clearPassword

  const test = async () => {
    setTesting(true)
    setResult(null)
    const { data, error } =
      kind === 'order' ? await BackofficeAPI.testOrderMailbox() : await BackofficeAPI.testNewsletterMailbox()
    setTesting(false)
    setResult(
      data
        ? { ok: true, text: tx('Connected as {user}. Drafts go into "{folder}".', { user: data.user, folder: data.draftsFolder }) }
        : { ok: false, text: error ? tx(error) : tx('Could not connect') }
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="mb-user" value={tx('Mailbox address')} />
          <TextInput
            id="mb-user"
            type="email"
            autoComplete="off"
            placeholder={kind === 'order' ? 'ponude@3dpartshop.com' : 'ime@3dpartshop.com'}
            value={value.user}
            onChange={(e) => set({ user: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="mb-from" value={tx('Sender name')} />
          <TextInput id="mb-from" value={value.fromName} onChange={(e) => set({ fromName: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="mb-host" value={tx('IMAP server')} />
          <TextInput id="mb-host" value={value.host} onChange={(e) => set({ host: e.target.value })} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {tx('Zoho mail: imap.zoho.eu, port 993. IMAP has to be on: the Zoho administrator allows it in the Admin Console, then it is switched on in Zoho Mail → Settings → Mail Accounts → IMAP.')}
          </p>
        </div>
        <div>
          <Label htmlFor="mb-port" value={tx('Port')} />
          <TextInput id="mb-port" type="number" value={value.port} onChange={(e) => set({ port: e.target.value })} />
        </div>
        {value.perDraft !== undefined && (
          <div>
            <Label htmlFor="mb-per-draft" value={tx('Recipients per draft')} />
            <TextInput
              id="mb-per-draft"
              type="number"
              min={1}
              max={500}
              value={value.perDraft}
              onChange={(e) => set({ perDraft: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {tx('Each draft gets at most this many customers in Bcc (1 to 500). Keep it within what the mail plan allows per message.')}
            </p>
          </div>
        )}
        <div className="md:col-span-2">
          <Label htmlFor="mb-pass" value={tx('Password')} />
          <TextInput
            id="mb-pass"
            type="password"
            autoComplete="new-password"
            placeholder={hasPassword ? tx('A password is saved. Type a new one to replace it.') : ''}
            value={value.password}
            onChange={(e) => set({ password: e.target.value, clearPassword: false })}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {tx('With two-step sign-in on, use an application-specific password (Zoho → My Account → Security → App Passwords). The saved password is never shown again.')}
          </p>
          {hasPassword && (
            <Button size="xs" color="gray" className="mt-2" onClick={() => set({ password: '', clearPassword: true })}>
              {tx('Remove the password')}
            </Button>
          )}
          {value.clearPassword && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{tx('The password is removed when you save.')}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" color="gray" isProcessing={testing} disabled={testing} onClick={test}>
          {tx('Check the connection')}
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{tx('Save the settings first, then check.')}</span>
      </div>
      {result && (
        <p className={`text-sm ${result.ok ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
          {result.text}
        </p>
      )}
    </div>
  )
}

export default NewsletterMailboxSettings
