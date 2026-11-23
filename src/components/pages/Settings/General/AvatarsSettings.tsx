'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Spinner, TextInput } from 'flowbite-react'
import { HiTrash, HiUpload } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI, StoreManagerAPI } from '@/services'
import { useS3ManagerStore } from '@/store/store'
import { CustomerAvatar, DEFAULT_AVATARS, avatarImageSrc, newAvatarId } from '@/shared/helpers/avatars'

const MAX_AVATAR_BYTES = 1024 * 1024

/** Why the list cannot be saved, or null. */
export const customerAvatarsProblem = (avatars: CustomerAvatar[]) => {
  if (avatars.some((avatar) => !avatar.name.trim())) return 'Every avatar needs a name.'
  if (avatars.some((avatar) => avatar.name.trim().length > 40)) return 'An avatar name can have at most 40 characters.'
  return null
}

/**
 * The avatars customers pick on their profile: the shop's ten and the admin's
 * uploads. Unticked ones stay with the customers who have them but are not
 * offered any more; a removed one is taken off its customers (they get their
 * initials).
 */
const AvatarsSettings: React.FC<{
  value: CustomerAvatar[]
  onChange: (next: CustomerAvatar[]) => void
}> = ({ value, onChange }) => {
  const [usage, setUsage] = useState<Record<string, number>>({})
  const [uploading, setUploading] = useState(false)
  const { getS3FormData } = useS3ManagerStore()

  useEffect(() => {
    BackofficeAPI.getCustomerAvatarUsage().then((data) => setUsage(data ?? {}))
  }, [])

  const update = (id: string, patch: Partial<CustomerAvatar>) =>
    onChange(value.map((avatar) => (avatar.id === id ? { ...avatar, ...patch } : avatar)))

  const remove = (avatar: CustomerAvatar) => {
    const used = usage[avatar.id] ?? 0
    const question = used
      ? tx('{count} customers have this avatar; they get their initials instead. Remove it?', { count: used })
      : tx('Remove this avatar?')
    if (!window.confirm(question)) return
    onChange(value.filter((item) => item.id !== avatar.id))
  }

  // stored in the image bucket like the product images
  const upload = async (file?: File) => {
    if (!file) return
    if (file.size > MAX_AVATAR_BYTES) {
      toast(tx('The picture can be at most 1 MB.'), { type: 'error', autoClose: 3000 })
      return
    }
    setUploading(true)
    const s3Data = await getS3FormData()
    let uploaded = false
    if (s3Data?.url) {
      const formData = new FormData()
      for (const [key, field] of Object.entries(s3Data.fields)) {
        formData.append(key, field as string)
      }
      formData.append('file', file)
      uploaded = await StoreManagerAPI.uploadImagesOnS3(formData, s3Data.url)
      if (uploaded) {
        const name = file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim().slice(0, 40) || tx('Avatar')
        onChange([
          ...value,
          { id: newAvatarId(value.map((avatar) => avatar.id)), name, image: String(s3Data.fields.key) },
        ])
      }
    }
    setUploading(false)
    toast(uploaded ? tx('Avatar added. Save the settings to keep it.') : tx('Upload failed'), {
      type: uploaded ? 'success' : 'error',
      autoClose: 2500,
    })
  }

  const offered = value.filter((avatar) => !avatar.hidden).length
  // the shop's own ten can be brought back after being removed
  const missing = DEFAULT_AVATARS.filter((avatar) => !value.some((item) => item.id === avatar.id))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {tx('Customers can pick {count} of {total}.', { count: offered, total: value.length })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
        {missing.length > 0 && (
          <Button size="sm" color="gray" onClick={() => onChange([...value, ...missing])}>
            {tx("Bring back the shop's avatars ({count})", { count: missing.length })}
          </Button>
        )}
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-purple-700 px-3 py-2 text-sm font-medium text-white hover:bg-purple-800 ${
            uploading ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {uploading ? <Spinner size="sm" /> : <HiUpload className="h-4 w-4" />}
          {tx('Upload an avatar')}
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => {
              upload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {value.map((avatar) => {
          const used = usage[avatar.id] ?? 0
          return (
            <div
              key={avatar.id}
              className={`flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700 ${
                avatar.hidden ? 'border-dashed border-gray-300 opacity-70' : 'border-gray-200'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarImageSrc(avatar)}
                alt={avatar.name}
                className="h-14 w-14 shrink-0 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <TextInput
                  sizing="sm"
                  maxLength={40}
                  value={avatar.name}
                  placeholder={tx('Name')}
                  onChange={(e) => update(avatar.id, { name: e.target.value })}
                />
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Checkbox checked={!avatar.hidden} onChange={() => update(avatar.id, { hidden: !avatar.hidden })} />
                  {tx('Customers can pick it')}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {used ? tx('Customers: {count}', { count: used }) : tx('Not used')}
                  {!avatar.image && <span className="ml-1">· {tx('comes with the shop')}</span>}
                </p>
              </div>
              <Button size="xs" color="failure" title={tx('Remove')} onClick={() => remove(avatar)}>
                <HiTrash className="h-4 w-4" />
              </Button>
            </div>
          )
        })}
      </div>
      {value.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tx('No avatars: customers cannot pick one and show their initials.')}
        </p>
      )}
    </div>
  )
}

export default AvatarsSettings
