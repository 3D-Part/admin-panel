'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'

export type SiteRevalidateForm = { url: string; secret: string; hasSecret: boolean }

export const DEFAULT_SITE_REVALIDATE: SiteRevalidateForm = { url: 'https://www.3dpartshop.com', secret: '', hasSecret: false }

export const readSiteRevalidate = (settings: any): SiteRevalidateForm => ({
  url: settings?.siteRevalidate?.url || DEFAULT_SITE_REVALIDATE.url,
  secret: '',
  hasSecret: !!settings?.siteRevalidate?.hasSecret,
})

/** What goes into the settings: the secret only when a new one is typed. */
export const siteRevalidateSettings = (form: SiteRevalidateForm) => ({
  url: form.url.trim(),
  ...(form.secret.trim() ? { secret: form.secret.trim() } : {}),
})

/**
 * The site keeps its pages for a day and makes them again when the shop says
 * something changed: the address of the site and the secret it shares with
 * Vercel (REVALIDATE_SECRET), and a button to refresh it by hand.
 */
const SiteRevalidateSettings: React.FC<{
  value: SiteRevalidateForm
  onChange: (value: SiteRevalidateForm) => void
}> = ({ value, onChange }) => {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    setBusy(true)
    setResult(null)
    const data = await BackofficeAPI.revalidateSite()
    setBusy(false)
    setResult(data ? { ok: data.ok, text: tx(data.message) } : { ok: false, text: tx('The site could not be reached') })
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{tx('Site refresh')}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {tx('The site keeps its pages for a day and makes them again as soon as something is changed here or a customer orders. For that the site needs the same secret as here: on Vercel → the website project → Settings → Environment Variables, REVALIDATE_SECRET.')}
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="site-url" value={tx('Site address')} />
          <TextInput id="site-url" value={value.url} onChange={(e) => onChange({ ...value, url: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="site-secret" value={tx('Secret')} />
          <TextInput
            id="site-secret"
            type="password"
            autoComplete="new-password"
            value={value.secret}
            placeholder={value.hasSecret ? tx('A secret is saved. Type a new one to replace it.') : ''}
            onChange={(e) => onChange({ ...value, secret: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button size="sm" color="light" onClick={refresh} isProcessing={busy} disabled={busy}>
          {tx('Refresh the site now')}
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{tx('Save the settings first, then refresh.')}</span>
        {result && (
          <span className={`text-sm ${result.ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {result.text}
          </span>
        )}
      </div>
    </div>
  )
}

export default SiteRevalidateSettings
