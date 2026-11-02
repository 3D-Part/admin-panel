'use client'

import React, { useEffect, useState } from 'react'
import { Badge, Button, Label, Select, Textarea } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { CustomerFlag, CustomerProfile, DisputedFlag } from '@/services/backoffice'

const DISPUTED_REASONS: Record<DisputedFlag, string> = {
  NO_PICKUP: 'Did not collect the order',
  LATE_PAY: 'Late or missing payment',
  COMPLAINTS: 'Too many complaints',
  ABUSIVE: 'Abusive behaviour',
  OTHER: 'Other reason',
}

const OTHER_FLAGS = {
  BLUE: { label: 'Needs attention', color: 'bg-blue-500' },
  GREEN: { label: 'Good customer', color: 'bg-green-500' },
}

const isDisputed = (flag: CustomerFlag): flag is DisputedFlag =>
  flag in DISPUTED_REASONS

export const useCustomerProfiles = (emails: string[]) => {
  const [profiles, setProfiles] = useState<Record<string, CustomerProfile>>({})
  const key = Array.from(new Set(emails.filter(Boolean))).sort().join(',')

  useEffect(() => {
    if (!key) return
    BackofficeAPI.getCustomerProfiles(key.split(',')).then((data) => {
      if (data) setProfiles(data)
    })
  }, [key])

  return profiles
}

export const CustomerFlagBadge: React.FC<{ profile?: CustomerProfile }> = ({
  profile,
}) => {
  if (!profile || (!profile.flag && !profile.note)) return null

  const flag = profile.flag
  const flagLabel = !flag
    ? ''
    : isDisputed(flag)
    ? `Disputed: ${DISPUTED_REASONS[flag]}`
    : OTHER_FLAGS[flag].label

  return (
    <span
      title={[flagLabel, profile.note || ''].filter(Boolean).join('\n')}
      className="flex items-center gap-1 shrink-0"
    >
      {flag && isDisputed(flag) && <Badge color="failure">Disputed</Badge>}
      {flag && !isDisputed(flag) && (
        <span
          aria-label={flagLabel}
          className={`w-3 h-3 rounded-full ${OTHER_FLAGS[flag].color}`}
        />
      )}
      {profile.note && (
        <span
          aria-label="Customer note"
          className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
        />
      )}
    </span>
  )
}

export const CustomerProfileForm: React.FC<{ email: string }> = ({ email }) => {
  const profiles = useCustomerProfiles([email])
  const profile = profiles[email?.toLowerCase()]
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
    if (saved) toast('Customer saved', { type: 'success', autoClose: 2000 })
  }

  return (
    <div className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
      <div>
        <Label htmlFor="customer-flag" value="Customer status (staff only)" />
        <Select
          id="customer-flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value as CustomerFlag | '')}
        >
          <option value="">No status</option>
          <optgroup label="Disputed customer, reason:">
            {(Object.keys(DISPUTED_REASONS) as DisputedFlag[]).map((value) => (
              <option key={value} value={value}>
                {DISPUTED_REASONS[value]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Other">
            {(Object.keys(OTHER_FLAGS) as (keyof typeof OTHER_FLAGS)[]).map(
              (value) => (
                <option key={value} value={value}>
                  {OTHER_FLAGS[value].label}
                </option>
              )
            )}
          </optgroup>
        </Select>
      </div>
      <div>
        <Label htmlFor="customer-note" value="Customer note (staff only)" />
        <Textarea
          id="customer-note"
          rows={2}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <Button size="sm" color="purple" disabled={saving} onClick={save}>
        Save customer
      </Button>
    </div>
  )
}
