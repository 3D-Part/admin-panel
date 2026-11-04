'use client'

import React, { useState } from 'react'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import { HiDownload } from 'react-icons/hi'
import { BackofficeAPI } from '@/services'
import { ExportKind } from '@/services/backoffice'
import { modalRoot } from '@/shared/helpers/modalRoot'

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

/**
 * Saves a CSV that opens in Excel. Orders ask for a period first, products
 * and customers are always exported whole.
 */
const ExportButton: React.FC<{ kind: ExportKind }> = ({ kind }) => {
  const today = new Date()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [from, setFrom] = useState(
    isoDay(new Date(today.getFullYear(), today.getMonth(), 1))
  )
  const [to, setTo] = useState(isoDay(today))

  const download = async (params?: Record<string, string>) => {
    setBusy(true)
    const done = await BackofficeAPI.downloadExport(kind, params)
    setBusy(false)
    if (done) setOpen(false)
  }

  return (
    <>
      <Button
        size="sm"
        color="gray"
        className="shrink-0 py-1"
        disabled={busy}
        onClick={() => (kind === 'orders' ? setOpen(true) : download())}
      >
        <HiDownload className="mr-1 md:mr-2" />
        <span className="hidden sm:inline">Export</span>
      </Button>
      {kind === 'orders' && (
        <Modal root={modalRoot()} show={open} size="md" onClose={() => setOpen(false)}>
          <Modal.Header>Export orders</Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="export-from" value="From" />
                <TextInput
                  id="export-from"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="export-to" value="To" />
                <TextInput
                  id="export-to"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Every order made in the period, whatever its status.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="purple" disabled={busy} onClick={() => download({ from, to })}>
              Download CSV
            </Button>
            <Button color="gray" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  )
}

export default ExportButton
