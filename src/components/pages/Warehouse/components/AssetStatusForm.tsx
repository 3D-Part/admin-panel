'use client'

import { Button, Label, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import WarehouseAPI from '@/services/warehouse'
import {
  assetStatusLabels,
  assetStatusOrder,
} from '@/shared/helpers/warehouseLabels'
import { Asset, AssetStatus } from '@/shared/types/warehouse'

type AssetStatusFormProps = {
  asset: Asset
  onChanged: (asset: Asset) => void
}

/** Status, location and holder change in one step, written to the history */
const AssetStatusForm: React.FC<AssetStatusFormProps> = ({
  asset,
  onChanged,
}) => {
  const [status, setStatus] = useState<AssetStatus>(asset.status)
  const [location, setLocation] = useState(asset.location ?? '')
  const [assignedTo, setAssignedTo] = useState(asset.assignedTo ?? '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStatus(asset.status)
    setLocation(asset.location ?? '')
    setAssignedTo(asset.assignedTo ?? '')
  }, [asset])

  const unchanged =
    status === asset.status &&
    location === (asset.location ?? '') &&
    assignedTo === (asset.assignedTo ?? '') &&
    note.trim() === ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const result = await WarehouseAPI.changeAssetStatus(asset.id, {
      status,
      location,
      assignedTo,
      note: note || undefined,
    })
    setSaving(false)

    if (result) {
      setNote('')
      toast('Status upisan', { type: 'success', autoClose: 2000 })
      onChanged(result.asset)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor="asset-status" value="Status" />
        <Select
          id="asset-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as AssetStatus)}
        >
          {assetStatusOrder.map((value) => (
            <option key={value} value={value}>
              {assetStatusLabels[value]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="asset-location" value="Lokacija" />
        <TextInput
          id="asset-location"
          value={location}
          maxLength={100}
          placeholder="npr. Magacin, Radionica, Teren"
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="asset-assigned" value="Zaduženo kod" />
        <TextInput
          id="asset-assigned"
          value={assignedTo}
          maxLength={100}
          placeholder="ime osobe"
          onChange={(e) => setAssignedTo(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="asset-status-note" value="Napomena" />
        <TextInput
          id="asset-status-note"
          value={note}
          maxLength={500}
          placeholder="npr. poslano na servis zbog mlaznice"
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving || unchanged}>
          Sačuvaj promjenu
        </Button>
      </div>
    </form>
  )
}

export default AssetStatusForm
