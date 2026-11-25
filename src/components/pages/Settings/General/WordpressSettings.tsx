'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import BlogAPI, { blogError } from '@/services/blog'

export type WordpressForm = {
  baseUrl: string
  username: string
  appPassword: string
  hasPassword: boolean
  clearPassword: boolean
}

export const DEFAULT_WP_FORM: WordpressForm = {
  baseUrl: 'https://blog.3dpartshop.com',
  username: '',
  appPassword: '',
  hasPassword: false,
  clearPassword: false,
}

export const readWpForm = (stored: any): WordpressForm => ({
  ...DEFAULT_WP_FORM,
  baseUrl: stored?.baseUrl || DEFAULT_WP_FORM.baseUrl,
  username: stored?.username || '',
  hasPassword: !!stored?.hasPassword,
})

/** What goes into the settings: the password only when a new one is typed. */
export const wpSettings = (form: WordpressForm) => ({
  baseUrl: form.baseUrl.trim().replace(/\/+$/, ''),
  username: form.username.trim(),
  ...(form.appPassword.trim() ? { appPassword: form.appPassword.trim() } : {}),
  ...(form.clearPassword ? { clearPassword: true } : {}),
})

export const wpFormProblem = (form: WordpressForm): string | null =>
  form.baseUrl.trim() && !/^https?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/i.test(form.baseUrl.trim())
    ? 'The blog address must start with https:// (e.g. https://blog.3dpartshop.com)'
    : null

/** The form after a save: a typed password is saved now, it is not kept in the form. */
export const savedWpForm = (form: WordpressForm): WordpressForm =>
  form.clearPassword
    ? { ...form, appPassword: '', hasPassword: false, clearPassword: false }
    : form.appPassword.trim()
      ? { ...form, appPassword: '', hasPassword: true }
      : form

const WordpressSettings: React.FC<{ value: WordpressForm; onChange: (next: WordpressForm) => void }> = ({
  value,
  onChange,
}) => {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const set = (patch: Partial<WordpressForm>) => onChange({ ...value, ...patch })
  const hasPassword = value.hasPassword && !value.clearPassword

  const test = async () => {
    setTesting(true)
    setResult(null)
    try {
      const data = await BlogAPI.test()
      setResult({
        ok: data.canPublish,
        text: data.canPublish
          ? tx('Connected to {url} as {name} ({roles}).', { url: data.baseUrl, name: data.name, roles: data.roles.join(', ') })
          : tx('Connected as {name}, but the user may not publish posts: give it the Editor role in WordPress.', { name: data.name }),
      })
    } catch (error) {
      setResult({ ok: false, text: tx(blogError(error)) })
    }
    setTesting(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="wp-url" value={tx('Blog address')} />
          <TextInput id="wp-url" value={value.baseUrl} onChange={(e) => set({ baseUrl: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="wp-user" value={tx('WordPress user name')} />
          <TextInput id="wp-user" autoComplete="off" value={value.username} onChange={(e) => set({ username: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="wp-pass" value={tx('Password')} />
          <TextInput
            id="wp-pass"
            type="password"
            autoComplete="new-password"
            placeholder={hasPassword ? tx('A password is saved. Type a new one to replace it.') : 'xxxx xxxx xxxx xxxx xxxx xxxx'}
            value={value.appPassword}
            onChange={(e) => set({ appPassword: e.target.value, clearPassword: false })}
          />
          {hasPassword && (
            <Button size="xs" color="gray" className="mt-2" onClick={() => set({ appPassword: '', clearPassword: true })}>
              {tx('Remove the password')}
            </Button>
          )}
          {value.clearPassword && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{tx('The password is removed when you save.')}</p>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {tx('The password the user logs in to wp-admin with (an application password works too, where WordPress offers them). The user needs the Editor or Administrator role. The password stays on the server and is never shown again.')}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" color="gray" isProcessing={testing} disabled={testing} onClick={test}>
          {tx('Check the connection')}
        </Button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{tx('Save the settings first, then check.')}</span>
      </div>
      {result && (
        <p
          data-testid="wp-test-result"
          className={`text-sm ${result.ok ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}
        >
          {result.text}
        </p>
      )}
    </div>
  )
}

export default WordpressSettings
