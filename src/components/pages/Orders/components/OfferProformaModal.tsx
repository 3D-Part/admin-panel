'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button, Label, Modal, Spinner, TextInput } from 'flowbite-react'
import { HiOutlineArrowsExpand, HiOutlineMail, HiOutlinePlus, HiOutlineRefresh, HiOutlineTrash, HiX } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { WarningModal } from '@/components/common'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { useModalScroll } from '@/shared/hooks/useModalScroll'
import { OrdersAPI } from '@/services'
import type { ProformaDraft, ProformaDraftLine } from '@/services/orders'
import { Order } from '@/shared/types'

const toNumber = (value: number | string) => Number(String(value ?? '').replace(',', '.')) || 0

const money = (value: number) =>
  value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\./g, ' ')

const lineTotal = (line: ProformaDraftLine) =>
  Math.round(toNumber(line.quantity) * toNumber(line.price) * (1 - toNumber(line.discount) / 100) * 100) / 100

// an A4 page and the grey margin around it in the proforma
const SHEET_WIDTH = 834

const emptyLine = (): ProformaDraftLine => ({ code: '', name: '', unit: 'KOM', quantity: 1, price: 0, discount: 0 })

/**
 * The proforma (predračun) of an offer before it goes to the customer: filled
 * from the order, every field can be changed, the preview shows what the
 * customer gets. Saving keeps the changes on the offer; sending saves too.
 */
const OfferProformaModal: React.FC<{
  order: Order
  isOpen: boolean
  onClose: () => void
  onSent: (sent: Order) => void
}> = ({ order, isOpen, onClose, onSent }) => {
  const [draft, setDraft] = useState<ProformaDraft | null>(null)
  const [saved, setSaved] = useState(false)
  // the order changed after the proforma was saved: it was filled again from the order
  const [orderChanged, setOrderChanged] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [html, setHtml] = useState('')
  const [busy, setBusy] = useState<'' | 'save' | 'send' | 'reset'>('')
  const [confirming, setConfirming] = useState(false)
  const previewTimer = useRef<ReturnType<typeof setTimeout>>()
  const previewBox = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.7)
  const [previewHeight, setPreviewHeight] = useState(640)
  // the proforma over the whole screen at its real A4 size, as the customer gets it
  const [fullView, setFullView] = useState(false)
  useModalScroll(isOpen)

  useEffect(() => {
    if (!isOpen) return
    setDraft(null)
    setErrors([])
    OrdersAPI.getOfferDocument(order.id).then((result) => {
      if (!result) {
        toast(tx('Could not load the proforma'), { type: 'error' })
        onClose()
        return
      }
      setDraft(result.draft)
      setSaved(result.saved)
      setOrderChanged(!!result.orderChanged)
      setDirty(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order.id])

  // the A4 pages shrink to the width of the preview column
  useEffect(() => {
    const box = previewBox.current
    if (!box) return
    const fit = () => {
      setPreviewScale(Math.min(1, box.clientWidth / SHEET_WIDTH))
      setPreviewHeight(box.clientHeight)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [draft === null])

  // the preview follows the form, a moment after the typing stops
  useEffect(() => {
    if (!draft) return
    clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(async () => {
      const result = await OrdersAPI.previewOfferDocument(draft)
      if ('html' in result) {
        setHtml(result.html)
        setErrors([])
      } else {
        setErrors(result.errors)
      }
    }, 400)
    return () => clearTimeout(previewTimer.current)
  }, [draft])

  const change = (next: ProformaDraft) => {
    setDraft(next)
    setDirty(true)
  }
  const setField = (field: 'number' | 'date', value: string) => draft && change({ ...draft, [field]: value })
  const setCustomer = (field: keyof ProformaDraft['customer'], value: string) =>
    draft && change({ ...draft, customer: { ...draft.customer, [field]: value } })
  const setLine = (index: number, field: keyof ProformaDraftLine, value: string) =>
    draft && change({ ...draft, lines: draft.lines.map((line, i) => (i === index ? { ...line, [field]: value } : line)) })
  const removeLine = (index: number) => draft && change({ ...draft, lines: draft.lines.filter((_, i) => i !== index) })
  const addLine = () => draft && change({ ...draft, lines: [...draft.lines, emptyLine()] })

  const save = async () => {
    if (!draft) return
    setBusy('save')
    const result = await OrdersAPI.saveOfferDocument(order.id, draft)
    setBusy('')
    if ('draft' in result) {
      setDraft(result.draft)
      setSaved(true)
      setDirty(false)
      toast(tx('Proforma saved'), { type: 'success', autoClose: 2000 })
    } else {
      setErrors(result.errors)
    }
  }

  const reset = async () => {
    setBusy('reset')
    const result = await OrdersAPI.resetOfferDocument(order.id)
    setBusy('')
    if (result) {
      setDraft(result.draft)
      setSaved(false)
      setDirty(false)
    }
  }

  const send = async () => {
    if (!draft) return
    setBusy('send')
    const { data: sent, error } = await OrdersAPI.orderSendOffer(order.id, draft)
    setBusy('')
    setConfirming(false)
    if (!sent) {
      if (error) setErrors([error])
      return
    }
    toast(tx('Offer sent to {email}', { email: order.email }), { type: 'success', autoClose: 3000 })
    onSent(sent)
    onClose()
  }

  const total = draft ? draft.lines.reduce((sum, line) => sum + lineTotal(line), 0) : 0
  const input = 'text-sm'

  return (
    <>
      <Modal root={modalRoot()} show={isOpen} onClose={onClose} size="7xl">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">
            {tx('Proforma for {email}', { email: order.email })}
          </span>
          <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
            {saved && !dirty
              ? tx('Saved. The customer gets it only when you send it.')
              : orderChanged
              ? tx('The order changed after the proforma was saved, so it is filled again from the order (same number). Check it before sending.')
              : tx('Filled from the order. Change what you need, the preview shows what the customer gets.')}
          </p>
        </Modal.Header>
        <Modal.Body>
          {!draft ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="proforma-number" value={tx('Proforma number')} />
                    <TextInput id="proforma-number" className={input} value={draft.number} onChange={(e) => setField('number', e.target.value)} placeholder="547/2026" />
                  </div>
                  <div>
                    <Label htmlFor="proforma-date" value={tx('Date')} />
                    <TextInput id="proforma-date" className={input} value={draft.date} onChange={(e) => setField('date', e.target.value)} placeholder="24.11.2026" />
                  </div>
                </div>

                <fieldset className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <legend className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">{tx('Buyer')}</legend>
                  <TextInput className={input} value={draft.customer.name} onChange={(e) => setCustomer('name', e.target.value)} placeholder={tx('Company or full name')} aria-label={tx('Company or full name')} />
                  <TextInput className={input} value={draft.customer.street} onChange={(e) => setCustomer('street', e.target.value)} placeholder={tx('Street')} aria-label={tx('Street')} />
                  <TextInput className={input} value={draft.customer.town} onChange={(e) => setCustomer('town', e.target.value)} placeholder={tx('Post code, town')} aria-label={tx('Post code, town')} />
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput className={input} value={draft.customer.pib} onChange={(e) => setCustomer('pib', e.target.value)} placeholder="PIB" aria-label="PIB" />
                    <TextInput className={input} value={draft.customer.jib} onChange={(e) => setCustomer('jib', e.target.value)} placeholder="JIB" aria-label="JIB" />
                  </div>
                </fieldset>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tx('Lines')}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{tx('Prices with VAT, rabat in %')}</span>
                  </div>
                  <div className="space-y-3">
                    {draft.lines.map((line, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <div className="flex gap-2">
                          <TextInput className={`${input} w-28 shrink-0`} value={line.code} onChange={(e) => setLine(index, 'code', e.target.value)} placeholder={tx('Code')} aria-label={tx('Code')} />
                          <TextInput className={`${input} min-w-0 flex-1`} value={line.name} onChange={(e) => setLine(index, 'name', e.target.value)} placeholder={tx('Name')} aria-label={tx('Name')} />
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            title={tx('Remove the line')}
                            aria-label={tx('Remove the line')}
                            className="inline-flex h-[38px] w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-700"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5 sm:items-end">
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            {tx('Unit')}
                            <TextInput className={input} value={line.unit} onChange={(e) => setLine(index, 'unit', e.target.value)} />
                          </label>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            {tx('Quantity')}
                            <TextInput className={input} inputMode="decimal" value={String(line.quantity)} onChange={(e) => setLine(index, 'quantity', e.target.value)} />
                          </label>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            {tx('Price with VAT')}
                            <TextInput className={input} inputMode="decimal" value={String(line.price)} onChange={(e) => setLine(index, 'price', e.target.value)} />
                          </label>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            {tx('Rabat %')}
                            <TextInput className={input} inputMode="decimal" value={String(line.discount)} onChange={(e) => setLine(index, 'discount', e.target.value)} />
                          </label>
                          <div className="col-span-2 pb-2 text-right text-sm font-medium text-gray-900 sm:col-span-1 dark:text-white">
                            {money(lineTotal(line))} KM
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Button size="sm" color="light" onClick={addLine}>
                      <HiOutlinePlus className="mr-1 h-4 w-4" />
                      {tx('Add a line')}
                    </Button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {tx('To pay')}: <strong className="text-gray-900 dark:text-white">{money(total)} KM</strong>
                    </span>
                  </div>
                </div>

                {errors.length > 0 && (
                  <ul className="list-disc space-y-1 rounded-lg bg-red-50 py-3 pl-8 pr-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    {errors.map((error) => (
                      <li key={error}>{tx(error)}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {tx('Preview')}
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      A4
                    </span>
                  </span>
                  <Button size="xs" color="light" onClick={() => setFullView(true)} disabled={!html}>
                    <HiOutlineArrowsExpand className="mr-1.5 h-4 w-4" />
                    {tx('Full view')}
                  </Button>
                </div>
                {/* the proforma is A4 (794 px wide): shrunk to fit the column, scrolled inside */}
                <div
                  ref={previewBox}
                  className="h-[420px] w-full overflow-hidden rounded-lg border border-gray-200 bg-[#e9ecf1] xl:h-[640px] dark:border-gray-700"
                >
                  <iframe
                    title={tx('Preview')}
                    srcDoc={html}
                    sandbox=""
                    style={{
                      width: SHEET_WIDTH,
                      height: previewHeight / previewScale,
                      transform: `scale(${previewScale})`,
                      transformOrigin: '0 0',
                      border: 0,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        {fullView && <FullView html={html} number={draft?.number ?? ''} onClose={() => setFullView(false)} />}
        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
            <Button color="light" onClick={reset} disabled={!draft || !!busy} isProcessing={busy === 'reset'}>
              <HiOutlineRefresh className="mr-2 h-4 w-4" />
              {tx('Fill again from the order')}
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button color="light" onClick={onClose} disabled={!!busy}>
                {tx('Close')}
              </Button>
              <Button color="light" onClick={save} disabled={!draft || !!busy} isProcessing={busy === 'save'}>
                {tx('Save')}
              </Button>
              <Button color="purple" onClick={() => setConfirming(true)} disabled={!draft || !!busy || !order.email}>
                <HiOutlineMail className="mr-2 h-4 w-4" />
                {tx('Send by email')}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
      <WarningModal
        isOpen={confirming}
        onSave={send}
        onClose={() => setConfirming(false)}
        isLoading={busy === 'send'}
        buttonColor="purple"
        message={tx('Send the offer to {email}?', { email: order.email })}
      />
    </>
  )
}

export default OfferProformaModal

/**
 * The proforma over the whole screen, its A4 sheets at their real size (only
 * shrunk on a screen narrower than a sheet): exactly what the e-mail shows.
 */
const FullView: React.FC<{ html: string; number: string; onClose: () => void }> = ({ html, number, onClose }) => {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerWidth - 32) / SHEET_WIDTH))
    fit()
    window.addEventListener('resize', fit)
    // Esc closes this view only, not the proforma window under it
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      event.preventDefault()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('keydown', onKey, true)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-gray-900/90 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between gap-3 border-b border-gray-700 bg-gray-900 px-4 py-3 text-white">
        <div className="min-w-0">
          <div className="truncate font-semibold">{tx('Proforma {number}', { number })}</div>
          <div className="text-xs text-gray-400">{tx('A4, real size: this is what the customer gets by e-mail')}</div>
        </div>
        <Button size="sm" color="light" onClick={onClose}>
          <HiX className="mr-1.5 h-4 w-4" />
          {tx('Close')}
        </Button>
      </div>
      <div className="flex-1 overflow-hidden" onClick={onClose}>
        <div className="mx-auto h-full" style={{ width: SHEET_WIDTH * scale }} onClick={(event) => event.stopPropagation()}>
          <iframe
            title={tx('Full view')}
            srcDoc={html}
            sandbox=""
            style={{
              width: SHEET_WIDTH,
              height: `calc((100vh - 64px) / ${scale})`,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              border: 0,
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
