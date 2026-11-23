'use client'
import ProductCodes from '@/components/common/ProductCodes/ProductCodes'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Checkbox, Table, Textarea, TextInput } from 'flowbite-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { HiBell, HiExclamationCircle, HiClipboardList, HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { ActionNeeded, ManualAction, StockAlert } from '@/services/backoffice'
import Tabs from '@/components/common/Tabs/Tabs'
import { Loader } from '@/components/common'
import { useProductSearch } from '@/shared/hooks/useProductSearch'

/** One note per product, shared by both tabs. Saved when the field is left. */
const ProductNote: React.FC<{
  productId: string
  name: string
  note: string | null
}> = ({ productId, name, note }) => {
  const [value, setValue] = useState(note ?? '')
  const [saved, setSaved] = useState(note ?? '')

  const save = async () => {
    if (value.trim() === saved) return
    const response = await BackofficeAPI.setProductNote(productId, value)
    if (response) {
      setSaved(value.trim())
      toast(tx("Note saved"), { type: 'success', autoClose: 1500 })
    } else {
      toast(tx("The note was not saved"), { type: 'error', autoClose: 2000 })
    }
  }

  return (
    <Textarea
      aria-label={`Note for ${name}`}
      className="w-full text-sm"
      rows={2}
      placeholder={tx("Your note")}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
    />
  )
}

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
      toast(tx("Enter a valid price"), { type: 'error', autoClose: 2000 })
      return
    }
    setSaving(true)
    const saved = await BackofficeAPI.setProductCost(action.productId, price)
    setSaving(false)
    if (saved) {
      toast(tx("Purchase price saved"), { type: 'success', autoClose: 2000 })
      onSaved()
    }
  }

  return (
    <Table.Row>
      <Table.Cell data-label={tx("Product")} className="text-gray-900 dark:text-white">
        <ProductCodes block code={action.code} sku={action.sku} />
        <span className="block break-words font-medium">{action.name}</span>
        <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
          {action.reason}
        </span>
        <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">
          {tx("Selling price")}: {action.price.toFixed(2)} KM
        </span>
      </Table.Cell>
      <Table.Cell data-label={tx("Purchase price")}>
        <div className="flex items-center gap-2">
          <TextInput
            aria-label={`Purchase price of ${action.name}`}
            className="w-24"
            sizing="sm"
            inputMode="decimal"
            value={value}
            placeholder="0.00"
            onChange={(e) => setValue(e.target.value)}
          />
          <Button size="xs" disabled={saving} onClick={save}>
            {tx("Save")}
          </Button>
        </div>
      </Table.Cell>
      <Table.Cell data-label={tx("Note")}>
        <ProductNote
          productId={action.productId}
          name={action.name}
          note={action.note}
        />
      </Table.Cell>
    </Table.Row>
  )
}

/** Note of an entry that is not a catalog product, kept on the entry itself. */
const ManualNote: React.FC<{ id: string; title: string; note: string | null }> = ({ id, title, note }) => {
  const [value, setValue] = useState(note ?? '')
  const [saved, setSaved] = useState(note ?? '')

  const save = async () => {
    if (value.trim() === saved) return
    const response = await BackofficeAPI.saveManualAction({ title, details: value.trim(), kind: 'order' }, id)
    if (response) {
      setSaved(value.trim())
      toast(tx("Note saved"), { type: 'success', autoClose: 1500 })
    } else {
      toast(tx("The note was not saved"), { type: 'error', autoClose: 2000 })
    }
  }

  return (
    <Textarea
      aria-label={`Note for ${title}`}
      className="w-full text-sm"
      rows={2}
      placeholder={tx("Your note")}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
    />
  )
}

/** Tasks typed in by the team, next to what the system finds on its own. */
const ManualTasks = () => {
  const [tasks, setTasks] = useState<ManualAction[] | null>(null)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    // the "to order" entries live on the stock alerts tab
    setTasks(((await BackofficeAPI.getManualActions()) ?? []).filter((task) => task.kind === 'task'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = async () => {
    if (!title.trim()) return
    setSaving(true)
    const saved = await BackofficeAPI.saveManualAction({ title: title.trim(), details: details.trim() })
    setSaving(false)
    if (saved) {
      setTitle('')
      setDetails('')
      load()
    } else {
      toast(tx("The task was not saved"), { type: 'error', autoClose: 2000 })
    }
  }

  const toggle = async (task: ManualAction) => {
    await BackofficeAPI.saveManualAction(
      { title: task.title, details: task.details ?? '', done: !task.done },
      task.id
    )
    load()
  }

  const remove = async (task: ManualAction) => {
    await BackofficeAPI.deleteManualAction(task.id)
    load()
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex flex-col gap-2 md:flex-row">
        <TextInput
          className="md:w-72"
          aria-label={tx("Task")}
          placeholder={tx("What needs to be done?")}
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <TextInput
          className="md:flex-1"
          aria-label={tx("Details")}
          placeholder={tx("Details (optional)")}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <Button disabled={saving || !title.trim()} onClick={add}>
          {tx("Add task")}
        </Button>
      </div>

      {!tasks ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{tx("No tasks of our own yet.")}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 py-2">
              <Checkbox
                className="mt-1"
                checked={task.done}
                onChange={() => toggle(task)}
                aria-label={task.title}
              />
              <div className={`min-w-0 flex-1 ${task.done ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                <p className="break-words text-sm font-medium">{task.title}</p>
                {task.details && <p className="break-words text-sm text-gray-500 dark:text-gray-400">{task.details}</p>}
              </div>
              <Button size="xs" color="gray" onClick={() => remove(task)}>
                {tx("Delete")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
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
    return (
      <p className="text-gray-500 dark:text-gray-400">{tx("Nothing to do.")}</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table className="table-stack lg:table-fixed">
        <Table.Head>
          <Table.HeadCell className="lg:w-[46%]">{tx("Product")}</Table.HeadCell>
          <Table.HeadCell className="whitespace-nowrap lg:w-[27%]">{tx("Purchase price")}</Table.HeadCell>
          <Table.HeadCell className="lg:w-[27%]">{tx("Note")}</Table.HeadCell>
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

/** Search a product and put it on the list of things to order. */
const OrderPicker: React.FC<{
  onAdd: (id: string, name: string) => void
  onAddCustom: (name: string) => void
  skip: Set<string>
}> = ({ onAdd, onAddCustom, skip }) => {
  const [search, setSearch] = useState('')
  const { rows, loading, searched, onScroll } = useProductSearch(search)
  const shown = rows.filter((row) => !skip.has(row.id))

  return (
    <div className="relative mb-4 max-w-xl">
      <TextInput
        aria-label={tx("Add a product to order")}
        placeholder={tx("Add to the order list: search the catalog or type a new item")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search.trim().length >= 2 && (
        <ul
          onScroll={onScroll}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-2 border-b border-gray-100 px-3 py-2 text-left text-sm font-medium text-purple-700 hover:bg-gray-50 dark:border-gray-700 dark:text-purple-300 dark:hover:bg-gray-700"
              onClick={() => {
                onAddCustom(search.trim())
                setSearch('')
              }}
            >
              <HiPlus className="h-4 w-4 shrink-0" />
              <span className="min-w-0 break-words">
                {tx("Add as a new item")}: “{search.trim()}”
              </span>
            </button>
          </li>
          {shown.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  onAdd(product.id, product.name)
                  setSearch('')
                }}
              >
                <span className="min-w-0 text-gray-900 dark:text-white">
                  <ProductCodes block code={product.code} sku={product.sku} />
                  <span className="break-words">{product.name}</span>
                </span>
                <span className="shrink-0 text-xs text-gray-500">{product.quantity} {tx("in stock")}</span>
              </button>
            </li>
          ))}
          {loading && <li className="px-3 py-2 text-sm text-gray-500">…</li>}
          {!loading && searched && shown.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">{tx("Not in the catalog.")}</li>
          )}
        </ul>
      )}
    </div>
  )
}

const StockTab = () => {
  const [rows, setRows] = useState<StockAlert[] | null>(null)
  const [manual, setManual] = useState<ManualAction[]>([])

  const load = useCallback(async () => {
    const [alerts, tasks] = await Promise.all([
      BackofficeAPI.getStockAlerts(),
      BackofficeAPI.getManualActions(),
    ])
    setRows(alerts ?? [])
    setManual((tasks ?? []).filter((task) => task.kind === 'order' && !task.done))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = async (productId: string, name: string) => {
    const saved = await BackofficeAPI.saveManualAction({ title: name, productId })
    if (saved) {
      toast(tx("Added to the list"), { type: 'success', autoClose: 1500 })
      load()
    } else {
      toast(tx("The product was not added"), { type: 'error', autoClose: 2000 })
    }
  }

  const addCustom = async (name: string) => {
    const saved = await BackofficeAPI.saveManualAction({ title: name, kind: 'order' })
    if (saved) {
      toast(tx("Added to the list"), { type: 'success', autoClose: 1500 })
      load()
    } else {
      toast(tx("The product was not added"), { type: 'error', autoClose: 2000 })
    }
  }

  const remove = async (id: string) => {
    await BackofficeAPI.deleteManualAction(id)
    load()
  }

  if (!rows) return <Loader />

  const ordered = [...rows].sort(
    (a, b) => Number(b.level === 'critical') - Number(a.level === 'critical')
  )
  // the system already lists these; no second row for them
  const alertIds = new Set(rows.map((row) => row.id))
  const extra = manual.filter((task) => !task.productId || !alertIds.has(task.productId))
  const taken = new Set([...rows.map((row) => row.id), ...manual.flatMap((task) => (task.productId ? [task.productId] : []))])

  return (
    <div className="overflow-x-auto">
      <OrderPicker onAdd={add} onAddCustom={addCustom} skip={taken} />
      {ordered.length === 0 && extra.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No product has reached its limit. Limits are set per product, in Edit
          product → Stock & extras.
        </p>
      ) : (
        <Table className="table-stack lg:table-fixed">
          <Table.Head>
            <Table.HeadCell className="lg:w-[28%]">{tx("Product")}</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap lg:w-[10%]">{tx("In stock")}</Table.HeadCell>
            <Table.HeadCell className="lg:w-[20%]">{tx("Limits")}</Table.HeadCell>
            <Table.HeadCell className="whitespace-nowrap lg:w-[16%]">{tx("Status")}</Table.HeadCell>
            <Table.HeadCell className="lg:w-[26%]">{tx("Note")}</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
            {extra.map((task) => (
              <Table.Row key={task.id}>
                <Table.Cell data-label={tx("Product")} className="text-gray-900 dark:text-white">
                  {task.product ? (
                    <>
                      <ProductCodes block code={task.product.code} sku={task.product.sku} />
                      {task.product.name}
                    </>
                  ) : (
                    <>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">{tx("Not in the catalog")}</span>
                      <span className="break-words">{task.title}</span>
                    </>
                  )}
                </Table.Cell>
                <Table.Cell data-label={tx("In stock")}>{task.product ? task.product.quantity : '—'}</Table.Cell>
                <Table.Cell data-label={tx("Limits")}>—</Table.Cell>
                <Table.Cell data-label={tx("Status")}>
                  <div className="flex items-center gap-2">
                    <span
                      title={tx("Added by hand")}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-200"
                    >
                      <HiPencil className="h-3.5 w-3.5" />
                      {tx("Manual")}
                    </span>
                    <button
                      type="button"
                      title={tx("Remove")}
                      aria-label={tx("Remove")}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700"
                      onClick={() => remove(task.id)}
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </Table.Cell>
                <Table.Cell data-label={tx("Note")}>
                  {task.product && task.productId ? (
                    <ProductNote
                      productId={task.productId}
                      name={task.product.name}
                      note={task.product.note}
                    />
                  ) : (
                    <ManualNote id={task.id} title={task.title} note={task.details} />
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
            {ordered.map((alert) => (
              <Table.Row key={alert.id}>
                <Table.Cell data-label={tx("Product")} className="text-gray-900 dark:text-white">
                  <ProductCodes block code={alert.code} sku={alert.sku} />
                  {alert.name}
                </Table.Cell>
                <Table.Cell data-label={tx("In stock")}>{alert.quantity}</Table.Cell>
                <Table.Cell data-label={tx("Limits")}>
                  Yellow at {alert.lowStockWarning ?? '—'}, red at{' '}
                  {alert.lowStockCritical ?? '—'}
                </Table.Cell>
                <Table.Cell data-label={tx("Status")}>
                  <Badge
                    className="w-fit whitespace-nowrap"
                    color={alert.level === 'critical' ? 'failure' : 'warning'}
                  >
                    {alert.level === 'critical' ? tx("Order now") : tx("Running low")}
                  </Badge>
                </Table.Cell>
                <Table.Cell data-label={tx("Note")}>
                  <ProductNote
                    productId={alert.id}
                    name={alert.name}
                    note={alert.note}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  )
}

const ActionsNeededPage = () => {
  const router = useRouter()
  const pathname = usePathname()
  const param = useSearchParams().get('tab')
  const tab = param === 'stock' || param === 'tasks' ? param : 'actions'

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <Tabs.ModernTabs
        activeTab={tab}
        onTabChange={(id) => router.replace(`${pathname}?tab=${id}`)}
        tabs={[
          {
            id: 'actions',
            title: tx("Actions needed"),
            icon: HiExclamationCircle,
            content: <ActionsTab />,
          },
          {
            id: 'stock',
            title: tx("Stock alerts"),
            icon: HiBell,
            content: <StockTab />,
          },
          {
            id: 'tasks',
            title: tx("Workers tasks"),
            icon: HiClipboardList,
            content: <ManualTasks />,
          },
        ]}
      />
    </div>
  )
}

export default ActionsNeededPage
