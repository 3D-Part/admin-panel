'use client'

import { Button, Label, Modal, Select, TextInput, Textarea } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import WarehouseAPI from '@/services/warehouse'
import {
  assetStatusLabels,
  assetStatusOrder,
} from '@/shared/helpers/warehouseLabels'
import { Asset, AssetFormBody, AssetStatus } from '@/shared/types/warehouse'
import { useCurrentUserStore } from '@/store/store'
import AssetStatusForm from '../AssetStatusForm'
import MovementList from '../MovementList'
import { StockMovement } from '@/shared/types/warehouse'

type AssetFormModalProps = {
  isOpen: boolean
  // undefined = new asset
  asset?: Asset
  onClose: () => void
  onSaved: () => void
  onPrintLabel: (asset: Asset) => void
}

type FormState = {
  name: string
  category: string
  status: AssetStatus
  location: string
  assignedTo: string
  serialNumber: string
  purchaseDate: string
  purchasePrice: string
  note: string
}

const emptyForm: FormState = {
  name: '',
  category: '',
  status: 'IN_USE',
  location: '',
  assignedTo: '',
  serialNumber: '',
  purchaseDate: '',
  purchasePrice: '',
  note: '',
}

const toForm = (asset?: Asset): FormState =>
  asset
    ? {
        name: asset.name,
        category: asset.category ?? '',
        status: asset.status,
        location: asset.location ?? '',
        assignedTo: asset.assignedTo ?? '',
        serialNumber: asset.serialNumber ?? '',
        purchaseDate: asset.purchaseDate ?? '',
        purchasePrice:
          asset.purchasePrice != null ? String(asset.purchasePrice) : '',
        note: asset.note ?? '',
      }
    : emptyForm

const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSaved,
  onPrintLabel,
}) => {
  const { currentUser } = useCurrentUserStore()
  const [form, setForm] = useState<FormState>(toForm(asset))
  const [current, setCurrent] = useState<Asset | undefined>(asset)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [saving, setSaving] = useState(false)

  const loadMovements = async (id: string) => {
    const data = await WarehouseAPI.getMovements({ assetId: id, limit: 20 })
    setMovements(data?.rows ?? [])
  }

  useEffect(() => {
    if (!isOpen) return
    setForm(toForm(asset))
    setCurrent(asset)
    setMovements([])
    if (asset) loadMovements(asset.id)
  }, [isOpen, asset])

  const set =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm({ ...form, [field]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast('Enter a name', { type: 'error', autoClose: 2000 })
      return
    }

    const body: AssetFormBody = {
      name: form.name,
      category: form.category || null,
      location: form.location || null,
      assignedTo: form.assignedTo || null,
      serialNumber: form.serialNumber || null,
      purchaseDate: form.purchaseDate || null,
      purchasePrice: form.purchasePrice === '' ? null : Number(form.purchasePrice),
      note: form.note || null,
    }

    setSaving(true)
    const saved = current
      ? await WarehouseAPI.updateAsset(current.id, body)
      : await WarehouseAPI.createAsset({ ...body, status: form.status })
    setSaving(false)

    if (saved) {
      toast(current ? 'Saved' : `Created with code ${saved.code}`, {
        type: 'success',
        autoClose: 2500,
      })
      setCurrent(saved)
      setForm(toForm(saved))
      loadMovements(saved.id)
      onSaved()
    }
  }

  const remove = async () => {
    if (!current) return
    if (
      !window.confirm(
        `Delete ${current.code} ${current.name} with its history? For items no longer in use, choose the Written off status instead.`
      )
    )
      return
    if (await WarehouseAPI.deleteAsset(current.id)) {
      toast('Deleted', { type: 'success', autoClose: 2000 })
      onSaved()
      onClose()
    }
  }

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="3xl">
      <Modal.Header>
        {current ? (
          <span>
            <span className="font-mono">{current.code}</span> {current.name}
          </span>
        ) : (
          'New item'
        )}
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
        <form id="asset-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="asset-name" value="Name *" />
            <TextInput
              id="asset-name"
              value={form.name}
              maxLength={200}
              placeholder="e.g. Bambu Lab X1C, cordless drill"
              onChange={set('name')}
            />
          </div>
          <div>
            <Label htmlFor="asset-category" value="Type" />
            <TextInput
              id="asset-category"
              value={form.category}
              maxLength={100}
              placeholder="e.g. Printer, Tool, Computer"
              onChange={set('category')}
            />
          </div>
          <div>
            <Label htmlFor="asset-serial" value="Serial number" />
            <TextInput
              id="asset-serial"
              value={form.serialNumber}
              maxLength={100}
              onChange={set('serialNumber')}
            />
          </div>
          {!current && (
            <>
              <div>
                <Label htmlFor="asset-new-status" value="Status" />
                <Select
                  id="asset-new-status"
                  value={form.status}
                  onChange={set('status')}
                >
                  {assetStatusOrder.map((value) => (
                    <option key={value} value={value}>
                      {assetStatusLabels[value]}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="asset-new-location" value="Location" />
                <TextInput
                  id="asset-new-location"
                  value={form.location}
                  maxLength={100}
                  onChange={set('location')}
                />
              </div>
              <div>
                <Label htmlFor="asset-new-assigned" value="Assigned to" />
                <TextInput
                  id="asset-new-assigned"
                  value={form.assignedTo}
                  maxLength={100}
                  onChange={set('assignedTo')}
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="asset-date" value="Purchase date" />
            <TextInput
              id="asset-date"
              type="date"
              value={form.purchaseDate}
              onChange={set('purchaseDate')}
            />
          </div>
          <div>
            <Label htmlFor="asset-price" value="Purchase price (KM)" />
            <TextInput
              id="asset-price"
              type="number"
              min={0}
              step="0.01"
              value={form.purchasePrice}
              onChange={set('purchasePrice')}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="asset-note" value="Note" />
            <Textarea
              id="asset-note"
              rows={2}
              maxLength={2000}
              value={form.note}
              onChange={set('note')}
            />
          </div>
        </form>

        {current && (
          <>
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Status, location, assignment
              </h4>
              <AssetStatusForm
                asset={current}
                onChanged={(updated) => {
                  setCurrent(updated)
                  loadMovements(updated.id)
                  onSaved()
                }}
              />
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                History
              </h4>
              <MovementList movements={movements} />
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="flex flex-wrap gap-2">
        <Button type="submit" form="asset-form" disabled={saving}>
          {current ? 'Save details' : 'Create'}
        </Button>
        {current && (
          <Button color="light" onClick={() => onPrintLabel(current)}>
            Label
          </Button>
        )}
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
        {current && currentUser?.role === 'admin' && (
          <Button color="failure" className="ml-auto" onClick={remove}>
            Delete
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default AssetFormModal
