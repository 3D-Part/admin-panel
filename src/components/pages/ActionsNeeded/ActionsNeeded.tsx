'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Table, TextInput } from 'flowbite-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { HiBell, HiExclamationCircle } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { ActionNeeded, StockAlert } from '@/services/backoffice'
import Tabs from '@/components/common/Tabs/Tabs'
import { Loader } from '@/components/common'

const ActionRow: React.FC<{ action: ActionNeeded; onSaved: () => void }> = ({
  action,
  onSaved,
}) => {
  const [value, setValue] = useState(
    action.purchasePrice === null ? '' : String(action.purchasePrice)
  )
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const price = Number(value.replace(',', '.'))
    if (value.trim() === '' || !Number.isFinite(price) || price < 0) {
      toast('Enter a valid price', { type: 'error', autoClose: 2000 })
      return
    }
    setSaving(true)
    const saved = await BackofficeAPI.setProductCost(action.productId, price)
    setSaving(false)
    if (saved) {
      toast('Purchase price saved', { type: 'success', autoClose: 2000 })
      onSaved()
    }
  }

  return (
    <Table.Row>
      <Table.Cell className="text-gray-900 dark:text-white">
        <span className="block font-mono text-xs">{action.code}</span>
        {action.name}
      </Table.Cell>
      <Table.Cell>{action.reason}</Table.Cell>
      <Table.Cell>{action.price.toFixed(2)} KM</Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2">
          <TextInput
            aria-label={`Purchase price of ${action.name}`}
            className="w-28"
            sizing="sm"
            inputMode="decimal"
            value={value}
            placeholder="0.00"
            onChange={(e) => setValue(e.target.value)}
          />
          <Button size="xs" disabled={saving} onClick={save}>
            Save
          </Button>
        </div>
      </Table.Cell>
    </Table.Row>
  )
}

const ActionsTab = () => {
  const [rows, setRows] = useState<ActionNeeded[] | null>(null)
  const load = useCallback(async () => {
    setRows((await BackofficeAPI.getActionsNeeded()) ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (!rows) return <Loader />
  if (rows.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">Nothing to do.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <Table.HeadCell>Product</Table.HeadCell>
          <Table.HeadCell>Why it is listed</Table.HeadCell>
          <Table.HeadCell>Selling price</Table.HeadCell>
          <Table.HeadCell>Purchase price</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((action) => (
            <ActionRow
              key={`${action.type}-${action.productId}`}
              action={action}
              onSaved={load}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

const StockTab = () => {
  const [rows, setRows] = useState<StockAlert[] | null>(null)

  useEffect(() => {
    BackofficeAPI.getStockAlerts().then((data) => setRows(data ?? []))
  }, [])

  if (!rows) return <Loader />
  if (rows.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No product has reached its limit. Limits are set per product, in Edit
        product → Stock & extras.
      </p>
    )
  }

  const ordered = [...rows].sort(
    (a, b) => Number(b.level === 'critical') - Number(a.level === 'critical')
  )

  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Head>
          <Table.HeadCell>Product</Table.HeadCell>
          <Table.HeadCell>In stock</Table.HeadCell>
          <Table.HeadCell>Limits</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
          {ordered.map((alert) => (
            <Table.Row key={alert.id}>
              <Table.Cell className="text-gray-900 dark:text-white">
                <span className="block font-mono text-xs">{alert.code}</span>
                {alert.name}
              </Table.Cell>
              <Table.Cell>{alert.quantity}</Table.Cell>
              <Table.Cell>
                Yellow at {alert.lowStockWarning ?? '—'}, red at{' '}
                {alert.lowStockCritical ?? '—'}
              </Table.Cell>
              <Table.Cell>
                <Badge
                  className="w-fit"
                  color={alert.level === 'critical' ? 'failure' : 'warning'}
                >
                  {alert.level === 'critical' ? 'Order now' : 'Running low'}
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

const ActionsNeededPage = () => {
  const router = useRouter()
  const pathname = usePathname()
  const tab = useSearchParams().get('tab') === 'stock' ? 'stock' : 'actions'

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <Tabs.ModernTabs
        activeTab={tab}
        onTabChange={(id) => router.replace(`${pathname}?tab=${id}`)}
        tabs={[
          {
            id: 'actions',
            title: 'Actions needed',
            icon: HiExclamationCircle,
            content: <ActionsTab />,
          },
          {
            id: 'stock',
            title: 'Stock alerts',
            icon: HiBell,
            content: <StockTab />,
          },
        ]}
      />
    </div>
  )
}

export default ActionsNeededPage
