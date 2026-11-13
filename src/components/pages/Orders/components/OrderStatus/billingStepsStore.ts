'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { toast } from 'react-toastify'
import { tx } from '@/shared/i18n'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import { BillingOption } from '@/shared/helpers/billingOptions'
import { ORDER_STEPS, OrderStatusEnum } from '@/shared/enums'

// Steps and status per order as the server last returned them after a tick.
// The Status circles, the status badge and the Invoice dropdown of the same
// order all read from here, so a tick shows everywhere at once. Keyed by the
// order object, so a reloaded list starts from what the server sent.
type Live = { steps: Record<string, string>; status: string; busy?: boolean }
const changed = new WeakMap<Order, Live>()
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const set = (order: Order, live: Live) => {
  changed.set(order, live)
  emit()
}

const initial = (order: Order): Live => ({
  steps: order.billingSteps ?? EMPTY,
  status: order.status,
})

// one object per order, so useSyncExternalStore sees a stable snapshot
const snapshots = new WeakMap<Order, Live>()
const read = (order: Order): Live => {
  const live = changed.get(order)
  if (live) return live
  if (!snapshots.has(order)) snapshots.set(order, initial(order))
  return snapshots.get(order)!
}

export const useBillingSteps = (order: Order) => {
  const live = useSyncExternalStore(
    subscribe,
    () => read(order),
    () => read(order)
  )

  const toggle = useCallback(
    async (step: string) => {
      const previous = read(order)
      if (previous.busy) return
      const done = !previous.steps[step]
      const steps = { ...previous.steps }
      if (done) steps[step] = new Date().toISOString()
      else delete steps[step]
      set(order, { ...previous, steps, busy: true })

      // the server moves the status along with the main steps
      const saved = await OrdersAPI.orderSetBillingStep(order.id, step, done)
      if (saved?.billingSteps) {
        set(order, {
          steps: saved.billingSteps,
          status: saved.status ?? previous.status,
        })
      } else {
        set(order, previous)
        toast(tx('The invoice status was not saved'), {
          type: 'error',
          autoClose: 2000,
        })
      }
    },
    [order]
  )

  return { steps: live.steps, status: live.status, busy: !!live.busy, toggle }
}

const EMPTY: Record<string, string> = {}

export const formatStepDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('de-DE')
}

// Steps removed from Settings still show on the orders that have them
export const visibleSteps = (
  options: BillingOption[],
  steps: Record<string, string>
): BillingOption[] => [
  ...options,
  ...Object.keys(steps)
    .filter((id) => !options.some((option) => option.id === id))
    .map((id) => ({ id, label: id, color: 'gray' })),
]

// The four main statuses follow the ticked steps. Any other status (Cancelled,
// New, Offer, Returned…) paints every circle in its own color instead.
export const followsSteps = (status: string) =>
  (ORDER_STEPS as string[]).includes(status)

export const STATUS_DOT: Record<string, string> = {
  [OrderStatusEnum.Pending]: 'bg-indigo-500 border-indigo-500',
  [OrderStatusEnum.ProformaSent]: 'bg-amber-700 border-amber-700',
  [OrderStatusEnum.ReadyForPickup]: 'bg-pink-500 border-pink-500',
  [OrderStatusEnum.InvoiceIssued]: 'bg-green-600 border-green-600',
  [OrderStatusEnum.AwaitingPayment]: 'bg-green-600 border-green-600',
  [OrderStatusEnum.Paid]: 'bg-green-600 border-green-600',
  [OrderStatusEnum.InvoiceSent]: 'bg-green-600 border-green-600',
  [OrderStatusEnum.Returned]: 'bg-orange-500 border-orange-500',
  [OrderStatusEnum.Declined]: 'bg-red-600 border-red-600',
}

/** The last ticked step, in the order set in Settings. */
export const lastTicked = (
  options: BillingOption[],
  steps: Record<string, string>
): BillingOption | undefined =>
  [...visibleSteps(options, steps)].reverse().find((option) => steps[option.id])
