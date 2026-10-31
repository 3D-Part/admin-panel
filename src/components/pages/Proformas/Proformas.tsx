'use client'
import { modalRoot } from '@/shared/helpers/modalRoot'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Label,
  Modal,
  Pagination,
  Table,
  Textarea,
  TextInput,
} from 'flowbite-react'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI, WarehouseAPI } from '@/services'
import { Proforma, ProformaBody, ProformaItem } from '@/services/backoffice'
import { WarehouseProduct } from '@/shared/types/warehouse'

const PAGE_SIZE = 15

const CUSTOMER_FIELDS: { name: string; label: string }[] = [
  { name: 'companyName', label: 'Company' },
  { name: 'jib', label: 'JIB' },
  { name: 'companyPdv', label: 'VAT number' },
  { name: 'fullName', label: 'Full name' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'street', label: 'Street' },
  { name: 'city', label: 'City' },
  { name: 'postCode', label: 'Post code' },
]

const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ] as string
  )

const printProforma = (proforma: Proforma) => {
  const customer = proforma.customer || {}
  const rows = proforma.items
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.name)}<br/><small>${escapeHtml(item.sku)}</small></td>
        <td class="n">${item.quantity}</td>
        <td class="n">${Number(item.price).toFixed(2)}</td>
        <td class="n">${Number(item.total).toFixed(2)}</td>
      </tr>`
    )
    .join('')
  const win = window.open('', '_blank')
  if (!win) return

  // Text the customer reads, so it stays in the customer's language
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/>
    <title>${escapeHtml(proforma.number)}</title>
    <style>
      body{font:14px Arial,sans-serif;color:#111;margin:32px}
      h1{font-size:22px;margin:0 0 4px}
      table{width:100%;border-collapse:collapse;margin:24px 0}
      th,td{border-bottom:1px solid #ccc;padding:8px;text-align:left}
      .n{text-align:right}
      .totals{margin-left:auto;width:280px}
      .totals div{display:flex;justify-content:space-between;padding:4px 0}
      .grand{font-weight:bold;font-size:16px;border-top:2px solid #111}
    </style></head><body>
    <h1>Predračun ${escapeHtml(proforma.number)}</h1>
    <p>Datum: ${new Date(proforma.createdAt).toLocaleDateString('bs-BA')}
    ${proforma.validUntil ? `<br/>Važi do: ${new Date(proforma.validUntil).toLocaleDateString('bs-BA')}` : ''}</p>
    <p>${[customer.companyName, customer.jib && `JIB: ${customer.jib}`, customer.companyPdv && `PDV: ${customer.companyPdv}`, customer.fullName, customer.street, [customer.postCode, customer.city].filter(Boolean).join(' '), customer.email, customer.phone]
      .filter(Boolean)
      .map(escapeHtml)
      .join('<br/>')}</p>
    <table><thead><tr><th>Artikal</th><th class="n">Količina</th><th class="n">Cijena (KM)</th><th class="n">Ukupno (KM)</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="totals">
      <div><span>Artikli</span><span>${Number(proforma.price).toFixed(2)} KM</span></div>
      <div><span>Popust</span><span>${Number(proforma.discount)}%</span></div>
      <div><span>Dostava</span><span>${Number(proforma.shippingPrice).toFixed(2)} KM</span></div>
      <div class="grand"><span>Za platiti</span><span>${Number(proforma.total).toFixed(2)} KM</span></div>
    </div>
    ${proforma.note ? `<p>${escapeHtml(proforma.note)}</p>` : ''}
    <script>window.onload=function(){window.print()}</script>
    </body></html>`)
  win.document.close()
}

const ProformaModal: React.FC<{
  proforma: Proforma | null
  onClose: () => void
  onSaved: () => void
}> = ({ proforma, onClose, onSaved }) => {
  const [customer, setCustomer] = useState<Record<string, string>>(
    proforma?.customer ?? {}
  )
  const [items, setItems] = useState<ProformaItem[]>(proforma?.items ?? [])
  const [discount, setDiscount] = useState(String(Number(proforma?.discount ?? 0)))
  const [shipping, setShipping] = useState(
    String(Number(proforma?.shippingPrice ?? 0))
  )
  const [note, setNote] = useState(proforma?.note ?? '')
  const [validUntil, setValidUntil] = useState(proforma?.validUntil ?? '')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<WarehouseProduct[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setResults(await WarehouseAPI.searchProducts(search, 8))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const setItem = (index: number, changes: Partial<ProformaItem>) =>
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...changes } : item))
    )

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0
  )
  const total =
    subtotal - subtotal * ((Number(discount) || 0) / 100) + (Number(shipping) || 0)

  const save = async () => {
    if (items.length === 0) {
      toast('Add at least one item', { type: 'error', autoClose: 2000 })
      return
    }
    const body: ProformaBody = {
      orderId: proforma?.orderId ?? null,
      customer,
      items: items.map(({ productId, name, sku, quantity, price }) => ({
        ...(productId ? { productId } : {}),
        name,
        sku: sku ?? '',
        quantity: Number(quantity),
        price: Number(price),
      })),
      discount: Number(discount) || 0,
      shippingPrice: Number(shipping) || 0,
      note: note || null,
      validUntil: validUntil || null,
    }
    setSaving(true)
    const saved = proforma
      ? await BackofficeAPI.updateProforma(proforma.id, body)
      : await BackofficeAPI.createProforma(body)
    setSaving(false)
    if (saved) {
      toast(`${saved.number} saved`, { type: 'success', autoClose: 2000 })
      onSaved()
    }
  }

  return (
    <Modal root={modalRoot()} show size="4xl" onClose={onClose}>
      <Modal.Header>
        {proforma ? `Proforma ${proforma.number}` : 'New proforma'}
      </Modal.Header>
      <Modal.Body className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {CUSTOMER_FIELDS.map((field) => (
            <div key={field.name}>
              <Label htmlFor={`proforma-${field.name}`} value={field.label} />
              <TextInput
                id={`proforma-${field.name}`}
                value={customer[field.name] ?? ''}
                onChange={(e) =>
                  setCustomer({ ...customer, [field.name]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <TextInput
            placeholder="Add a product: name, code or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {results.length > 0 && (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded border border-gray-200 dark:border-gray-700">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => {
                      setItems((current) => [
                        ...current,
                        {
                          productId: product.id,
                          name: product.name,
                          sku: product.sku,
                          quantity: 1,
                          price: Number(product.price),
                        },
                      ])
                      setSearch('')
                    }}
                  >
                    {product.name}{' '}
                    <span className="text-gray-500">
                      {Number(product.price).toFixed(2)} KM
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button
            size="xs"
            color="gray"
            onClick={() =>
              setItems((current) => [
                ...current,
                { name: '', sku: '', quantity: 1, price: 0 },
              ])
            }
          >
            Add a custom line
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex flex-wrap items-center gap-2">
              <TextInput
                aria-label="Name"
                className="flex-1 min-w-[200px]"
                value={item.name}
                placeholder="Name"
                onChange={(e) => setItem(index, { name: e.target.value })}
              />
              <TextInput
                aria-label="Quantity"
                className="w-20"
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  setItem(index, { quantity: Number(e.target.value) })
                }
              />
              <TextInput
                aria-label="Price"
                className="w-28"
                type="number"
                min={0}
                step="0.01"
                value={item.price}
                onChange={(e) => setItem(index, { price: Number(e.target.value) })}
              />
              <Button
                aria-label="Remove"
                size="xs"
                color="failure"
                onClick={() =>
                  setItems((current) => current.filter((_, i) => i !== index))
                }
              >
                <HiTrash />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="proforma-discount" value="Discount (%)" />
            <TextInput
              id="proforma-discount"
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="proforma-shipping" value="Shipping (KM)" />
            <TextInput
              id="proforma-shipping"
              type="number"
              min={0}
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="proforma-valid" value="Valid until" />
            <TextInput
              id="proforma-valid"
              type="date"
              value={validUntil ?? ''}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="proforma-note" value="Note, printed on the proforma" />
          <Textarea
            id="proforma-note"
            rows={2}
            value={note ?? ''}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Total: {total.toFixed(2)} KM
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button disabled={saving} onClick={save}>
          Save
        </Button>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const Proformas = () => {
  const [rows, setRows] = useState<Proforma[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Proforma | 'new' | null>(null)

  const load = useCallback(async () => {
    const data = await BackofficeAPI.getProformas(
      PAGE_SIZE,
      (page - 1) * PAGE_SIZE,
      search
    )
    if (data) {
      setRows(data.rows)
      setCount(data.count)
    }
  }, [page, search])

  useEffect(() => {
    const timeout = setTimeout(load, 250)
    return () => clearTimeout(timeout)
  }, [load])

  const remove = async (proforma: Proforma) => {
    if (!window.confirm(`Delete ${proforma.number}?`)) return
    await BackofficeAPI.deleteProforma(proforma.id)
    load()
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="mr-auto text-3xl font-bold text-gray-900 dark:text-white">
          Proformas
        </h2>
        <TextInput
          placeholder="Number, company, name"
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
        <Button color="purple" onClick={() => setEditing('new')}>
          Add new <HiPlus className="ml-2" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Number</Table.HeadCell>
            <Table.HeadCell>Customer</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Total</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((proforma) => (
              <Table.Row key={proforma.id}>
                <Table.Cell
                  className="cursor-pointer font-mono text-gray-900 dark:text-white"
                  onClick={() => setEditing(proforma)}
                >
                  {proforma.number}
                </Table.Cell>
                <Table.Cell>
                  {proforma.customer?.companyName || proforma.customer?.fullName || '—'}
                </Table.Cell>
                <Table.Cell>
                  {new Date(proforma.createdAt).toLocaleDateString('en-GB')}
                </Table.Cell>
                <Table.Cell>{Number(proforma.total).toFixed(2)} KM</Table.Cell>
                <Table.Cell>
                  <div className="flex justify-end gap-2">
                    <Button size="xs" color="light" onClick={() => printProforma(proforma)}>
                      Print
                    </Button>
                    <Button size="xs" color="gray" onClick={() => setEditing(proforma)}>
                      Edit
                    </Button>
                    <Button size="xs" color="failure" onClick={() => remove(proforma)}>
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {rows.length === 0 && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
            No proformas yet.
          </p>
        )}
      </div>

      {count > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(count / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}

      {editing && (
        <ProformaModal
          proforma={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}

export default Proformas
