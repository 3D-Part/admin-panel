'use client'

import { Badge, Button, Select, Table, TextInput } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import WarehouseAPI from '@/services/warehouse'
import {
  assetStatusColor,
  assetStatusLabels,
  assetStatusOrder,
} from '@/shared/helpers/warehouseLabels'
import { Asset } from '@/shared/types/warehouse'
import AssetFormModal from './AssetFormModal'

const PAGE_SIZE = 50

type AssetsProps = {
  onPrintLabels: (assets: Asset[]) => void
}

const Assets: React.FC<AssetsProps> = ({ onPrintLabels }) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState<Asset[]>([])
  const [count, setCount] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Asset | undefined>()

  const load = useCallback(
    async (offset = 0) => {
      const data = await WarehouseAPI.getAssets({
        search: search || undefined,
        status: status || undefined,
        limit: PAGE_SIZE,
        offset,
      })
      if (!data) return
      setCount(data.count)
      setRows((previous) =>
        offset === 0 ? data.rows : [...previous, ...data.rows]
      )
    },
    [search, status]
  )

  useEffect(() => {
    const timeout = setTimeout(() => load(0), 300)
    return () => clearTimeout(timeout)
  }, [load])

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const open = (asset?: Asset) => {
    setEditing(asset)
    setModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TextInput
          className="flex-1 min-w-[14rem]"
          value={search}
          placeholder="naziv, šifra, lokacija, osoba, serijski broj"
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Svi statusi</option>
          {assetStatusOrder.map((value) => (
            <option key={value} value={value}>
              {assetStatusLabels[value]}
            </option>
          ))}
        </Select>
        <Button
          color="light"
          disabled={selected.size === 0}
          onClick={() =>
            onPrintLabels(rows.filter((asset) => selected.has(asset.id)))
          }
        >
          Etikete ({selected.size})
        </Button>
        <Button onClick={() => open()}>
          <HiPlus className="w-4 h-4 mr-1" />
          Novo sredstvo
        </Button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Stvari koje firma posjeduje, a ne prodaje: printeri, alat, oprema. Svaka
        dobija svoju šifru (INV…) i istoriju statusa.
      </p>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="w-8">
              <input
                type="checkbox"
                aria-label="Izaberi sve"
                checked={rows.length > 0 && selected.size === rows.length}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? new Set(rows.map((asset) => asset.id))
                      : new Set()
                  )
                }
              />
            </Table.HeadCell>
            <Table.HeadCell>Šifra</Table.HeadCell>
            <Table.HeadCell>Naziv</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Lokacija</Table.HeadCell>
            <Table.HeadCell>Zaduženo</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {rows.map((asset) => (
              <Table.Row
                key={asset.id}
                className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                onClick={() => open(asset)}
              >
                <Table.Cell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label={`Izaberi ${asset.code}`}
                    checked={selected.has(asset.id)}
                    onChange={() => toggle(asset.id)}
                  />
                </Table.Cell>
                <Table.Cell className="font-mono whitespace-nowrap">
                  {asset.code}
                </Table.Cell>
                <Table.Cell className="text-gray-900 dark:text-white">
                  {asset.name}
                  {asset.category && (
                    <span className="block text-xs text-gray-500">
                      {asset.category}
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Badge color={assetStatusColor[asset.status]} className="w-fit">
                    {assetStatusLabels[asset.status]}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{asset.location || '—'}</Table.Cell>
                <Table.Cell>{asset.assignedTo || '—'}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {rows.length === 0 && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
            Nema unesenih sredstava.
          </p>
        )}
      </div>

      {rows.length < count && (
        <Button color="gray" className="self-center" onClick={() => load(rows.length)}>
          Učitaj još ({count - rows.length})
        </Button>
      )}

      <AssetFormModal
        isOpen={modalOpen}
        asset={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => load(0)}
        onPrintLabel={(asset) => {
          setModalOpen(false)
          onPrintLabels([asset])
        }}
      />
    </div>
  )
}

export default Assets
