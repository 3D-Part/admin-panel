'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { BackofficeAPI } from '@/services'
import { Analytics as AnalyticsData } from '@/services/backoffice'

// thousands grouped, two decimals: 278.804,90 KM
const money = (value: number) =>
  `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM`
const dateLabel = (value: string) => value.slice(0, 10).split('-').reverse().join('.')

/**
 * What customers paid for shipping, and what we paid the couriers. The shop
 * does not know the second one (the couriers invoice later), so it is typed in:
 * an amount and the number of orders it covers, on the date of the invoice.
 * The entries inside the chosen period are added up.
 */
const ShippingSection: React.FC<{
  totals: AnalyticsData['totals']
  entries: AnalyticsData['shippingPaid']
  to: string
  onChange: () => void
}> = ({ totals, entries, to, onChange }) => {
  const [paidOn, setPaidOn] = useState(to)
  const [amount, setAmount] = useState('')
  const [ordersCount, setOrdersCount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const value = Number(amount.replace(',', '.'))
  const count = Number(ordersCount)
  const valid =
    paidOn && amount.trim() !== '' && value >= 0 && Number.isInteger(count) && count >= 0 && ordersCount !== ''

  const add = async () => {
    setSaving(true)
    const saved = await BackofficeAPI.addShippingPaid({
      paidOn,
      amount: value,
      ordersCount: count,
      note: note.trim() || null,
    })
    setSaving(false)
    if (saved === null) return
    setAmount('')
    setOrdersCount('')
    setNote('')
    onChange()
  }

  const remove = async (id: string) => {
    if ((await BackofficeAPI.deleteShippingPaid(id)) !== null) onChange()
  }

  return (
    <section
      id="shipping"
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tx('Shipping')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tx('What we paid the couriers is typed in, because the shop cannot know it. The entries inside the chosen period are added up; with none, an estimate from the delivery cost in Settings is used.')}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {tx('Enter what we paid the couriers')}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-[calc(50%-0.375rem)] sm:w-auto [&_input]:w-full">
            <Label htmlFor="shipping-paid-on" value={tx('Date')} />
            <TextInput
              id="shipping-paid-on"
              type="date"
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
            />
          </div>
          <div className="w-[calc(50%-0.375rem)] sm:w-auto [&_input]:w-full">
            <Label htmlFor="shipping-paid-amount" value={tx('Amount (KM)')} />
            <TextInput
              id="shipping-paid-amount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="w-[calc(50%-0.375rem)] sm:w-auto [&_input]:w-full">
            <Label htmlFor="shipping-paid-orders" value={tx('Orders covered')} />
            <TextInput
              id="shipping-paid-orders"
              inputMode="numeric"
              placeholder="0"
              value={ordersCount}
              onChange={(e) => setOrdersCount(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[12rem] [&_input]:w-full">
            <Label htmlFor="shipping-paid-note" value={tx('Note')} />
            <TextInput
              id="shipping-paid-note"
              placeholder={tx('Courier, invoice number…')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button onClick={add} disabled={!valid || saving}>
            {tx('Add')}
          </Button>
        </div>

        {entries.length > 0 && (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 text-sm dark:divide-gray-700 dark:border-gray-700">
            {entries.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2">
                <span className="text-gray-500 dark:text-gray-400">{dateLabel(entry.paidOn)}</span>
                <span className="font-medium text-gray-900 dark:text-white">{money(entry.amount)}</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {tx('{orders} orders', { orders: entry.ordersCount })}
                </span>
                {entry.note && (
                  <span className="min-w-0 flex-1 truncate text-gray-500 dark:text-gray-400">
                    {entry.note}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  className="ml-auto text-red-600 hover:underline dark:text-red-400"
                >
                  {tx('Delete')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default ShippingSection
