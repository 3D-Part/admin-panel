'use client'
import { tx } from '@/shared/i18n'

import React, { useRef, useState } from 'react'
import { Button, Label, Textarea, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'
import { URLPartsEnum } from '@/shared/enums'

export type GoogleAnalyticsForm = {
  propertyId: string
  // a newly pasted JSON key; the saved one never comes back
  serviceAccount: string
  hasKey: boolean
  clientEmail: string
  clearKey: boolean
}

export const DEFAULT_GA_FORM: GoogleAnalyticsForm = {
  propertyId: '',
  serviceAccount: '',
  hasKey: false,
  clientEmail: '',
  clearKey: false,
}

export const readGaForm = (stored: any): GoogleAnalyticsForm => ({
  ...DEFAULT_GA_FORM,
  propertyId: stored?.propertyId || '',
  hasKey: !!stored?.hasKey,
  clientEmail: stored?.clientEmail || '',
})

/** What goes into the settings: the key only when a new one is pasted. */
export const gaSettings = (form: GoogleAnalyticsForm) => ({
  propertyId: form.propertyId.trim(),
  ...(form.serviceAccount.trim() ? { serviceAccount: form.serviceAccount.trim() } : {}),
  ...(form.clearKey ? { clearKey: true } : {}),
})

/** The form after a save: the pasted key is gone from it, only that one is saved. */
export const savedGaForm = (form: GoogleAnalyticsForm): GoogleAnalyticsForm => {
  if (form.clearKey) return { ...form, serviceAccount: '', hasKey: false, clientEmail: '', clearKey: false }
  if (!form.serviceAccount.trim()) return form
  let clientEmail = form.clientEmail
  try {
    clientEmail = JSON.parse(form.serviceAccount).client_email || clientEmail
  } catch {}
  return { ...form, serviceAccount: '', hasKey: true, clientEmail }
}

/** A problem with what is typed, said before saving. */
export const gaFormProblem = (form: GoogleAnalyticsForm): string | null => {
  const id = form.propertyId.trim().replace(/^properties\//, '')
  if (id && !/^\d{3,20}$/.test(id)) {
    return 'The property ID is the number from GA → Admin → Property details, not the G- measurement ID'
  }
  if (form.serviceAccount.trim()) {
    try {
      const parsed = JSON.parse(form.serviceAccount)
      if (!parsed?.client_email || !parsed?.private_key) {
        return 'The JSON is not a service account key (client_email and private_key are missing)'
      }
    } catch {
      return 'The key is not valid JSON: paste the whole downloaded file'
    }
  }
  return null
}

const GoogleAnalyticsSettings: React.FC<{
  value: GoogleAnalyticsForm
  onChange: (next: GoogleAnalyticsForm) => void
}> = ({ value, onChange }) => {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<GoogleAnalyticsForm>) => onChange({ ...value, ...patch })
  const hasKey = value.hasKey && !value.clearKey

  const readFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) set({ serviceAccount: await picked.text(), clearKey: false })
    e.target.value = ''
  }

  const test = async () => {
    setTesting(true)
    setResult(null)
    const { data, error } = await BackofficeAPI.testGoogleAnalytics()
    setTesting(false)
    setResult(
      data
        ? {
            ok: true,
            text: tx('Connected to property {id} as {email}: {users} users in the last 7 days.', {
              id: data.propertyId,
              email: data.clientEmail,
              users: data.activeUsers,
            }),
          }
        : { ok: false, text: error ? tx(error) : tx('Could not connect') }
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ga-property" value={tx('GA4 property ID')} />
        <TextInput
          id="ga-property"
          inputMode="numeric"
          placeholder="123456789"
          value={value.propertyId}
          onChange={(e) => set({ propertyId: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {tx('The number in Google Analytics → Admin → Property details (Property ID), not the G-... measurement ID.')}
        </p>
      </div>
      <div>
        <Label htmlFor="ga-key" value={tx('Service account key (JSON)')} />
        {hasKey && (
          <p className="mb-1 text-sm text-gray-700 dark:text-gray-300">
            {tx('A key is saved for {email}. Paste a new one to replace it.', { email: value.clientEmail })}
          </p>
        )}
        <Textarea
          id="ga-key"
          rows={5}
          autoComplete="off"
          spellCheck={false}
          className="font-mono text-xs"
          placeholder='{ "type": "service_account", "client_email": "...", "private_key": "..." }'
          value={value.serviceAccount}
          onChange={(e) => set({ serviceAccount: e.target.value, clearKey: false })}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <input ref={file} type="file" accept=".json,application/json" className="hidden" onChange={readFile} />
          <Button size="xs" color="gray" onClick={() => file.current?.click()}>
            {tx('Load the JSON file')}
          </Button>
          {hasKey && (
            <Button size="xs" color="gray" onClick={() => set({ serviceAccount: '', clearKey: true })}>
              {tx('Remove the key')}
            </Button>
          )}
        </div>
        {value.clearKey && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{tx('The key is removed when you save.')}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {tx('The key stays on the server and is never shown again. The service account needs Viewer access to the property; the Guide says how to make one.')}{' '}
          <a className="underline" href={URLPartsEnum.Guide}>
            {tx('Guide')}
          </a>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" color="gray" isProcessing={testing} disabled={testing} onClick={test}>
          {tx('Check the connection')}
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{tx('Save the settings first, then check.')}</span>
      </div>
      {result && (
        <p
          data-testid="ga-test-result"
          className={`text-sm ${result.ok ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}
        >
          {result.text}
        </p>
      )}
    </div>
  )
}

export default GoogleAnalyticsSettings
