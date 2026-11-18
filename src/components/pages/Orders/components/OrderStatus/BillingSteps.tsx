'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiCheck, HiChevronDown } from 'react-icons/hi'
import { Order } from '@/shared/types'
import {
  BILLING_COLORS,
  BillingOption,
  StepLists,
  billingDot,
  listFor,
  otherList,
  statusOf,
} from '@/shared/helpers/billingOptions'
import { STATUS_DOT, formatStepDate, useBillingSteps, visibleSteps } from './billingStepsStore'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'
import { OrderStatusEnum } from '@/shared/enums'

// What ticking a step also does, by the status it is tied to
const tickNote = (option: BillingOption, status: string): string | null => {
  const tied = statusOf(option)
  if (tied === OrderStatusEnum.Accepted && status === OrderStatusEnum.Pending)
    return 'The customer gets an email that the order is accepted.'
  if (tied === OrderStatusEnum.Shipping)
    return 'The customer gets an email that the order is on its way, once per order.'
  if (tied === OrderStatusEnum.Finished)
    return 'The customer gets the points for this order.'
  if (tied === OrderStatusEnum.Declined)
    return 'Cancels the order; the reason you write goes to the customer by email.'
  return null
}

const PANEL_WIDTH = 256

/**
 * The Invoice column: the ticked steps as text, and a dropdown of checkboxes
 * to tick or clear them. The circles and the status in the Status column
 * follow along; the server moves the order status with the main steps.
 */
const BillingSteps: React.FC<{
  order: Order
  lists: StepLists
  disabled?: boolean
}> = ({ order, lists, disabled }) => {
  const { steps, status, busy, toggle } = useBillingSteps(order)
  // a step tied to Cancelled first asks for the reason
  const [asking, setAsking] = useState<BillingOption | null>(null)
  const [reason, setReason] = useState('')
  const options = listFor(lists, status, order.isOffer)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const shown = visibleSteps(options, steps, otherList(lists, status, order.isOffer))

  const onTick = (option: BillingOption) => {
    if (!steps[option.id] && statusOf(option) === OrderStatusEnum.Declined) {
      setReason('')
      setAsking(option)
      return
    }
    toggle(option.id)
  }
  const ticked = shown.filter((option) => steps[option.id])
  const text = ticked.length
    ? ticked.map((option) => tx(option.label)).join(', ')
    : '—'
  // the button shows the last ticked step of the list (the last filled
  // circle), in that step's color; with none ticked, the status as the
  // circles show it
  // Cancelled and Returned paint every circle, so they win over older steps
  const ended =
    (status === OrderStatusEnum.Declined || status === OrderStatusEnum.Returned) &&
    !ticked.some((option) => statusOf(option) === status)
  const latest = ended ? undefined : [...ticked].reverse()[0]
  const statusFill = !latest ? STATUS_DOT[status] : undefined

  // the panel is fixed to the screen, so the table cannot clip it
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const left = Math.min(
      Math.max(8, rect.left),
      window.innerWidth - PANEL_WIDTH - 8
    )
    setPosition({ top: rect.bottom + 6, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      const target = e.target as Node
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      )
        return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    setAsking(null)
    const onScroll = (e: Event) =>
      !panelRef.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        title={text}
        className={`flex w-full max-w-[10rem] items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium ${
          latest
            ? `${BILLING_COLORS[latest.color] ?? BILLING_COLORS.gray} border-transparent`
            : statusFill
            ? `${statusFill} text-white`
            : 'text-gray-500 dark:text-gray-400 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
        } ${disabled ? 'cursor-default' : 'hover:opacity-90'}`}
      >
        <span className="truncate">
          {latest ? tx(latest.label) : statusFill ? getOrderStatusLabel(status) : '—'}
        </span>
        {!disabled && <HiChevronDown className="h-4 w-4 shrink-0" />}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={`${tx('Invoice')} ${order.orderNumber}`}
            style={{ top: position.top, left: position.left, width: PANEL_WIDTH }}
            className="fixed z-[60] rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          >
            {asking ? (
              <form
                className="space-y-2 p-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!reason.trim()) return
                  toggle(asking.id, reason.trim())
                  setAsking(null)
                }}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {tx(asking.label)}
                </p>
                <label
                  htmlFor="cancel-reason"
                  className="block text-xs text-gray-600 dark:text-gray-300"
                >
                  {tx('Reason for cancelling, the customer gets it by email')}
                </label>
                <textarea
                  id="cancel-reason"
                  autoFocus
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAsking(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {tx('Back')}
                  </button>
                  <button
                    type="submit"
                    disabled={!reason.trim()}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {tx('Cancel the order')}
                  </button>
                </div>
              </form>
            ) : shown.map((option) => {
              const dot = billingDot(option.color)
              const done = Boolean(steps[option.id])
              return (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    busy ? 'cursor-wait opacity-60' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={done}
                    disabled={busy}
                    onChange={() => onTick(option)}
                  />
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      option.color === 'white' ? 'text-gray-900' : 'text-white'
                    } peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 ${
                      done ? dot.fill : dot.ring
                    }`}
                  >
                    {done && <HiCheck className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">
                    {tx(option.label)}
                    {!done && tickNote(option, status) && (
                      <span className="block text-xs text-amber-600 dark:text-amber-400">
                        {tx(tickNote(option, status)!)}
                      </span>
                    )}
                  </span>
                  {done && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatStepDate(steps[option.id])}
                    </span>
                  )}
                </label>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}

export default BillingSteps
