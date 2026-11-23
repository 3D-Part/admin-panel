'use client'
import { tx } from '@/shared/i18n'
import React, { useEffect, useMemo, useState } from 'react'
import { TextInput } from 'flowbite-react'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import ProductCodes from '@/components/common/ProductCodes/ProductCodes'
import { SalePills } from '@/components/common/SaleMarks/SaleMarks'
import { SalesAPI } from '@/services'
import { ProductOnSale } from '@/shared/types'
import { refreshSaleTags } from '@/shared/helpers/saleTags'
import { normalizeText } from '@/shared/helpers/normalizeText'

const money = (value: number) => `${value.toFixed(2)} KM`

/**
 * One product of the sale: the sale price is changed right in the list (saved
 * on Enter or when the field is left), the pencil opens the product.
 */
const SaleProductRow: React.FC<{
  row: ProductOnSale
  onPriceSaved: (id: string, price: string) => void
  onRemove: (id: string) => void
}> = ({ row, onPriceSaved, onRemove }) => {
  const regular = Number(row.product.price)
  const [price, setPrice] = useState(String(row.discountedPrice))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPrice(String(row.discountedPrice))
  }, [row.discountedPrice])

  const value = Number(price.replace(',', '.'))
  const discount = regular > 0 && Number.isFinite(value) ? Math.round(((regular - value) / regular) * 100) : 0

  const save = async () => {
    if (Number(row.discountedPrice) === value) return
    if (!Number.isFinite(value) || value <= 0) {
      toast(tx('Enter the sale price'), { type: 'error', autoClose: 2000 })
      setPrice(String(row.discountedPrice))
      return
    }
    setSaving(true)
    const saved = await SalesAPI.updateProductOnSale([{ id: row.id, discountedPrice: value }])
    setSaving(false)
    if (!saved) {
      setPrice(String(row.discountedPrice))
      return
    }
    onPriceSaved(row.id, String(value))
    refreshSaleTags()
    toast(tx('Sale price of {name} saved', { name: row.product.name }), {
      type: 'success',
      autoClose: 1500,
      hideProgressBar: true,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex-1 min-w-[12rem]">
        <ProductCodes block code={row.product.code} sku={row.product.sku} />
        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white break-words">
          {row.product.name}
        </p>
        {/* the other sales the product is on */}
        <SalePills compact productId={row.productId} exceptSaleId={row.saleId} />
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <span className="block text-xs line-through text-gray-400 dark:text-gray-500">
            {money(regular)}
          </span>
          {discount !== 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              -{discount}%
            </span>
          )}
        </div>
        <TextInput
          aria-label={tx('Sale price of {name}', { name: row.product.name })}
          className="w-24"
          sizing="sm"
          inputMode="decimal"
          disabled={saving}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              ;(e.target as HTMLInputElement).blur()
            }
          }}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">KM</span>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={`/products/edit?id=${row.productId}`}
          target="_blank"
          rel="noreferrer"
          title={tx('Edit product')}
          aria-label={tx('Edit product')}
          className="p-2 sm:p-1.5 text-gray-500 hover:text-purple-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-purple-300 dark:hover:bg-gray-700 rounded-md"
        >
          <HiPencil className="w-4 h-4" />
        </a>
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          className="p-2 sm:p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
          title={tx('Remove from sale')}
          aria-label={tx('Remove from sale')}
        >
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/** The products of a sale, with a search by name, code or SKU. */
const SaleProductsList: React.FC<{
  rows: ProductOnSale[]
  onPriceSaved: (id: string, price: string) => void
  onRemove: (id: string) => void
}> = ({ rows, onPriceSaved, onRemove }) => {
  const [search, setSearch] = useState('')

  const shown = useMemo(() => {
    const words = normalizeText(search).split(' ').filter(Boolean)
    const sorted = [...rows].sort((a, b) => a.product.name.localeCompare(b.product.name))
    if (words.length === 0) return sorted
    return sorted.filter((row) => {
      const text = normalizeText(
        [row.product.name, row.product.code, row.product.sku, row.product.ean].filter(Boolean).join(' ')
      )
      return words.every((word) => text.includes(word))
    })
  }, [rows, search])

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          {tx('Products on sale')} ({rows.length})
        </h3>
        <TextInput
          data-enter-ignore
          className="w-full sm:w-72"
          sizing="sm"
          placeholder={tx('Search: name, code or SKU')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        {tx('Change the sale price right in the list; it is saved when you press Enter or leave the field.')}
      </p>
      {shown.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{tx('No product found')}</p>
      ) : (
        <div className="grid gap-2 sm:gap-3 max-h-[28rem] overflow-y-auto">
          {shown.map((row) => (
            <SaleProductRow key={row.id} row={row} onPriceSaved={onPriceSaved} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SaleProductsList
