'use client'
import { tx } from '@/shared/i18n'
import InfoTip from '@/components/common/InfoTip/InfoTip'

import React, { useEffect, useState } from 'react'
import { Button, Label, Select, Textarea } from 'flowbite-react'
import { HiFlag } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { CustomerFlag, CustomerProfile } from '@/services/backoffice'
import {
  CUSTOMER_FLAG_COLORS,
  CustomerFlagType,
  useCustomerFlagTypes,
} from '@/shared/helpers/customerFlags'

/** What a status is called and which color its flag has; red means disputed. */
export const flagInfo = (flag: CustomerFlag, types: CustomerFlagType[]) => {
  const type = types.find((item) => item.id === flag)
  if (!type) return { label: tx('Removed status ({flag})', { flag }), color: CUSTOMER_FLAG_COLORS.gray.text, disputed: false }
  const disputed = type.color === 'red'
  return {
    label: disputed ? tx('Disputed: {flag}', { flag: type.label }) : type.label,
    color: (CUSTOMER_FLAG_COLORS[type.color] ?? CUSTOMER_FLAG_COLORS.gray).text,
    disputed,
  }
}

// Saving a customer bumps this, so every open list loads the profiles again
let version = 0
const listeners = new Set<() => void>()
const profilesChanged = () => {
  version++
  listeners.forEach((listener) => listener())
}

export const useCustomerProfiles = (emails: string[]) => {
  const [profiles, setProfiles] = useState<Record<string, CustomerProfile>>({})
  const [seen, setSeen] = useState(version)
  const key = Array.from(new Set(emails.filter(Boolean).map((e) => e.toLowerCase())))
    .sort()
    .join(',')

  useEffect(() => {
    const listener = () => setSeen(version)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!key) return
    BackofficeAPI.getCustomerProfiles(key.split(',')).then((data) => {
      if (data) setProfiles(data)
    })
  }, [key, seen])

  return profiles
}

/**
 * The customer's flag next to their name: green good, orange on the edge, red
 * disputed. A neutral customer shows nothing. A dot marks a customer note.
 * `withLabel` also writes what the flag means.
 */
export const CustomerFlagBadge: React.FC<{
  profile?: CustomerProfile
  withLabel?: boolean
}> = ({ profile, withLabel = false }) => {
  const types = useCustomerFlagTypes()
  if (!profile || (!profile.flag && !profile.note)) return null

  const info = profile.flag ? flagInfo(profile.flag, types) : null

  return (
    <span
      title={[info?.label, profile.note || ''].filter(Boolean).join('\n')}
      className="inline-flex items-center gap-1 shrink-0"
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        {info && <HiFlag aria-label={info.label} className={`h-4 w-4 ${info.color}`} />}
        {profile.note && (
          <span
            aria-label={tx("Customer note")}
            className={`rounded-full bg-amber-400 ${
              info ? 'absolute -top-0.5 -right-1 h-2 w-2 ring-2 ring-white dark:ring-gray-800' : 'h-2 w-2'
            }`}
          />
        )}
      </span>
      {info && withLabel && (
        <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
      )}
    </span>
  )
}

/**
 * The status and note of a customer, the same on every order of theirs. On an
 * order (`inOrder`) the box is titled as the customer's, next to the order's
 * own note, so the two are not mixed up.
 */
export const CustomerProfileForm: React.FC<{ email: string; inOrder?: boolean }> = ({
  email,
  inOrder = false,
}) => {
  const profiles = useCustomerProfiles([email])
  const profile = profiles[email?.toLowerCase()]
  const types = useCustomerFlagTypes()
  const plain = types.filter((type) => type.color !== 'red')
  const disputed = types.filter((type) => type.color === 'red')
  const [flag, setFlag] = useState<CustomerFlag | ''>('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFlag(profile?.flag ?? '')
    setNote(profile?.note ?? '')
  }, [profile])

  const save = async () => {
    setSaving(true)
    const saved = await BackofficeAPI.saveCustomerProfile({
      email,
      flag: flag || null,
      note: note.trim() || null,
    })
    setSaving(false)
    if (saved) {
      toast(tx("Customer saved"), { type: 'success', autoClose: 2000 })
      profilesChanged()
    }
  }

  return (
    <div className="relative w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
      {inOrder && (
        <>
          <h4 className="pr-8 text-sm font-semibold text-gray-900 dark:text-white">
            {tx('About the customer')} <span className="font-normal text-gray-500">({email})</span>
          </h4>
          <InfoTip
            text={tx(
              'Status and note of the customer, not of this order. They show on all orders and offers of this customer. The customer never sees them.'
            )}
          />
        </>
      )}
      <div>
        <Label htmlFor="customer-flag" value={tx("Customer status (staff only)")} />
        <Select
          id="customer-flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value as CustomerFlag | '')}
        >
          <option value="">{tx("Neutral (no flag)")}</option>
          {plain.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
          {disputed.length > 0 && (
            <optgroup label={tx("Disputed customer, reason:")}>
              {disputed.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </optgroup>
          )}
          {flag && !types.some((type) => type.id === flag) && (
            <option value={flag}>{tx('Removed status ({flag})', { flag })}</option>
          )}
        </Select>
      </div>
      <div>
        <Label
          htmlFor="customer-note"
          value={tx(inOrder ? 'Note about the customer' : 'Customer note (staff only)')}
        />
        <Textarea
          id="customer-note"
          rows={2}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button size="sm" color="purple" disabled={saving} onClick={save}>
        {tx("Save customer")}
      </Button>
    </div>
  )
}

// Profiles asked for in the same moment go out in one request
const profileCache = new Map<string, CustomerProfile | null>()
let cacheVersion = version
let queued = new Set<string>()
let pending: Promise<void> | null = null

const loadProfile = (email: string): Promise<void> => {
  if (cacheVersion !== version) {
    profileCache.clear()
    cacheVersion = version
  }
  queued.add(email)
  if (!pending) {
    pending = Promise.resolve().then(async () => {
      const batch = Array.from(queued)
      queued = new Set()
      pending = null
      const data = await BackofficeAPI.getCustomerProfiles(batch)
      batch.forEach((key) => profileCache.set(key, data?.[key] ?? null))
    })
  }
  return pending
}

/**
 * The flag of one customer, for lists that do not load the profiles
 * themselves (analytics, order emails, subscribers).
 */
export const CustomerFlagFor: React.FC<{ email?: string | null; withLabel?: boolean }> = ({
  email,
  withLabel,
}) => {
  const key = (email ?? '').trim().toLowerCase()
  const [profile, setProfile] = useState<CustomerProfile | null | undefined>(() =>
    key && cacheVersion === version ? profileCache.get(key) : undefined
  )
  const [seen, setSeen] = useState(version)

  useEffect(() => {
    const listener = () => setSeen(version)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  useEffect(() => {
    if (!key) return
    let live = true
    if (cacheVersion === version && profileCache.has(key)) {
      setProfile(profileCache.get(key))
      return
    }
    loadProfile(key).then(() => {
      if (live) setProfile(profileCache.get(key) ?? null)
    })
    return () => {
      live = false
    }
  }, [key, seen])

  return profile ? <CustomerFlagBadge profile={profile} withLabel={withLabel} /> : null
}
