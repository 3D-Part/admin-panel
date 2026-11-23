'use client'
import { tx } from '@/shared/i18n'
import { useProductSearch } from '@/shared/hooks/useProductSearch'
import SearchListFooter from '@/components/common/SearchListFooter/SearchListFooter'
import { modalRoot } from '@/shared/helpers/modalRoot'

import React, { useState } from 'react'
import { Alert, Button, Label, Modal, TextInput } from 'flowbite-react'
import { HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI } from '@/services'
import { Order } from '@/shared/types'
import { WarehouseProduct } from '@/shared/types/warehouse'
import { OrderStatusEnum } from '@/shared/enums'

type Line = { productId: string; name: string; quantity: number; price: number }

const CONTACT_FIELDS = [
  { name: 'fullName', label: 'Full name' },
  { name: 'companyName', label: 'Company' },
  // no longer asked on the site; kept for older orders that have one
  { name: 'companyPdv', label: 'VAT number' },
  { name: 'jib', label: 'JIB' },
  { name: 'email', label: 'Email' },
  { name: 'phone', label: 'Phone' },
  { name: 'street', label: 'Street' },
  { name: 'city', label: 'City' },
  { name: 'postCode', label: 'Post code' },
  { name: 'description', label: 'Customer description' },
]

const OrderEditor: React.FC<{
  order: Order
  onClose: () => void
  onSaved: (order: Order) => void
  // a new offer made by hand: saved as a new order in the offers
  create?: boolean
}> = ({ order, onClose, onSaved, create = false }) => {
  const [lines, setLines] = useState<Line[]>(
    order.products.map((product) => ({
      productId: product.id,
      name: product.name,
      quantity: Number(product.quantity),
      price: Number(product.price),
    }))
  )
  const [contact, setContact] = useState<Record<string, string>>(
    Object.fromEntries(
      CONTACT_FIELDS.map(({ name }) => [name, (order as any)[name] ?? ''])
    )
  )
  const [discount, setDiscount] = useState(String(Number(order.discount) || 0))
  const [shipping, setShipping] = useState(
    String(Number(order.shippingPrice) || 0)
  )
  const [search, setSearch] = useState('')
  const found = useProductSearch(search)
  const [saving, setSaving] = useState(false)

  const setLine = (index: number, changes: Partial<Line>) =>
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, ...changes } : line))
    )

  const add = (product: WarehouseProduct) => {
    setSearch('')
    setLines((current) =>
      current.some((line) => line.productId === product.id)
        ? current.map((line) =>
            line.productId === product.id
              ? { ...line, quantity: line.quantity + 1 }
              : line
          )
        : [
            ...current,
            {
              productId: product.id,
              name: product.name,
              quantity: 1,
              price: Number(product.price),
            },
          ]
    )
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.price,
    0
  )
  const total =
    subtotal -
    subtotal * ((Number(discount) || 0) / 100) +
    (Number(shipping) || 0) -
    (Number(order.points) || 0)

  const save = async () => {
    if (lines.length === 0) {
      toast(tx("An order needs at least one product"), {
        type: 'error',
        autoClose: 2000,
      })
      return
    }
    setSaving(true)
    const body = {
      ...contact,
      products: lines.map(({ productId, quantity, price }) => ({
        productId,
        quantity,
        price,
      })),
      discount: Number(discount) || 0,
      shippingPrice: Number(shipping) || 0,
    }
    if (create) {
      const { data, error } = await BackofficeAPI.createOffer(body)
      setSaving(false)
      if (!data) {
        toast(error ? tx(error) : tx('The offer was not made'), { type: 'error', autoClose: 5000 })
        return
      }
      toast(tx('Offer {number} made; send it with the envelope icon', { number: data.orderNumber }), {
        type: 'success',
        autoClose: 4000,
      })
      onSaved(data)
      return
    }
    const saved = await BackofficeAPI.editOrder(order.id, body)
    setSaving(false)
    if (saved) {
      toast(tx("Order saved"), { type: 'success', autoClose: 2000 })
      onSaved(saved)
    }
  }

  // new orders, offers, cancelled and returned ones hold no stock
  const stockTaken = !create && ![
    OrderStatusEnum.Pending,
    OrderStatusEnum.ProformaSent,
    OrderStatusEnum.Declined,
    OrderStatusEnum.Returned,
  ].includes(order.status as OrderStatusEnum)

  return (
    <Modal root={modalRoot()} show size="4xl" onClose={onClose}>
      <Modal.Header>
        {create ? tx('New offer') : `${tx('Edit order')} #${order.orderNumber}`}
      </Modal.Header>
      <Modal.Body className="space-y-6">
        {stockTaken && (
          <Alert color="info">
            {tx("If stock was already taken for this order, quantity changes also change the stock.")}
          </Alert>
        )}

        <div className="space-y-2">
          <TextInput
            placeholder={tx("Add a product: name, code or SKU")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {found.searched && found.rows.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tx("No product found")}
            </p>
          )}
          {found.rows.length > 0 && (
            <div className="rounded border border-gray-200 dark:border-gray-700">
            <ul
              className="max-h-72 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700"
              onScroll={found.onScroll}
            >
              {found.rows.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => add(product)}
                  >
                    {product.name}{' '}
                    <span className="text-gray-500">
                      {Number(product.price).toFixed(2)} KM,{' '}
                      {product.quantity ?? 0} in stock
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <SearchListFooter
              shown={found.rows.length}
              count={found.count}
              loading={found.loading}
              hasMore={found.hasMore}
              onMore={found.loadMore}
            />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={line.productId} className="flex flex-wrap items-center gap-2">
              <span className="flex-1 min-w-[200px] text-sm text-gray-900 dark:text-white">
                {line.name}
              </span>
              <TextInput
                aria-label={`Quantity of ${line.name}`}
                className="w-20"
                type="number"
                min={1}
                value={line.quantity}
                onChange={(e) =>
                  setLine(index, { quantity: Math.max(1, Number(e.target.value)) })
                }
              />
              <TextInput
                aria-label={`Price of ${line.name}`}
                className="w-28"
                type="number"
                min={0}
                step="0.01"
                value={line.price}
                onChange={(e) =>
                  setLine(index, { price: Number(e.target.value) })
                }
              />
              <Button
                aria-label={`Remove ${line.name}`}
                size="xs"
                color="failure"
                onClick={() =>
                  setLines((current) => current.filter((_, i) => i !== index))
                }
              >
                <HiTrash />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="edit-discount" value={tx("Discount (%)")} />
            <TextInput
              id="edit-discount"
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-shipping" value={tx("Shipping (KM)")} />
            <TextInput
              id="edit-shipping"
              type="number"
              min={0}
              step="0.01"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {CONTACT_FIELDS.filter(({ name }) => name !== 'companyPdv' || !!order.companyPdv).map(({ name, label }) => (
            <div key={name}>
              <Label htmlFor={`edit-${name}`} value={tx(label)} />
              <TextInput
                id={`edit-${name}`}
                value={contact[name]}
                onChange={(e) =>
                  setContact({ ...contact, [name]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Total: {total.toFixed(2)} KM
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button disabled={saving} onClick={save}>
          {tx("Save")}
        </Button>
        <Button color="gray" onClick={onClose}>
          {tx("Close")}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderEditor
