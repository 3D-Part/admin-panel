'use client'

import React, { useEffect, useState } from 'react'
import { Button, Label, Select, Textarea } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { CustomerFlag, CustomerProfile } from '@/services/backoffice'

const FLAG_COLOR: Record<CustomerFlag, string> = {
  RED: 'bg-red-500',
  BLUE: 'bg-blue-500',
  GREEN: 'bg-green-500',
}

const FLAG_LABEL: Record<CustomerFlag, string> = {
  RED: 'Red: difficult customer',
  BLUE: 'Blue: needs attention',
  GREEN: 'Green: good customer',
}

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

  return (
    <span
      title={[
        profile.flag ? FLAG_LABEL[profile.flag] : '',
        profile.note || '',
      ]
        .filter(Boolean)
        .join('\n')}
      className="flex items-center gap-1 shrink-0"
    >
      {profile.flag && (
        <span
          aria-label={FLAG_LABEL[profile.flag]}
          className={`w-3 h-3 rounded-full ${FLAG_COLOR[profile.flag]}`}
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
        <Label htmlFor="customer-flag" value="Customer flag (staff only)" />
        <Select
          id="customer-flag"
          value={flag}
          onChange={(e) => setFlag(e.target.value as CustomerFlag | '')}
        >
          <option value="">No flag</option>
          {(Object.keys(FLAG_LABEL) as CustomerFlag[]).map((value) => (
            <option key={value} value={value}>
              {FLAG_LABEL[value]}
            </option>
          ))}
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
