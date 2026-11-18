'use client'
import { tx } from '@/shared/i18n'
import { useProductSearch } from '@/shared/hooks/useProductSearch'
import SearchListFooter from '@/components/common/SearchListFooter/SearchListFooter'

import React, { useState } from 'react'
import { Button, TextInput } from 'flowbite-react'
import { toast } from 'react-toastify'
import { SalesAPI } from '@/services'
import { WarehouseProduct } from '@/shared/types/warehouse'
import { useSalesSliceStore } from '@/store/store'

const SaleProductRow: React.FC<{
  product: WarehouseProduct
  onAdd: (price: number) => Promise<void>
}> = ({ product, onAdd }) => {
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const add = async () => {
    const value = Number(price.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      toast(tx("Enter the sale price"), { type: 'error', autoClose: 2000 })
      return
    }
    setSaving(true)
    await onAdd(value)
    setSaving(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex-1 min-w-[10rem]">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {product.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {product.code} · regular price {Number(product.price).toFixed(2)} KM
        </p>
      </div>
      <TextInput
        aria-label={`Sale price of ${product.name}`}
        className="w-28"
        sizing="sm"
        inputMode="decimal"
        placeholder={tx("Sale price")}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <Button size="xs" color="purple" disabled={saving} onClick={add}>
        {tx("Add")}
      </Button>
    </div>
  )
}

/** Find products right on the sale and put them on it. */
const SaleProductSearch = () => {
  const [search, setSearch] = useState('')
  const found = useProductSearch(search)

  const { activeSale, changeActiveSale, fetchSales, currentPage, itemsPerPage } =
    useSalesSliceStore()

  const add = async (product: WarehouseProduct, price: number) => {
    if (!activeSale?.id) return

    const saved = await SalesAPI.addProductOnSale([
      { saleId: activeSale.id, productId: product.id, discountedPrice: price },
    ])
    if (!saved) {
      toast(tx("{name} could not be added. Is it already on a sale?", { name: product.name }), {
        type: 'error',
        autoClose: 3000,
      })
      return
    }

    toast(`${product.name} added`, { type: 'success', autoClose: 2000 })
    // the list carries the products of each sale, a single sale does not
    await fetchSales({
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    })
    const fresh = useSalesSliceStore
      .getState()
      .currentPageSales.find((sale) => sale.id === activeSale.id)
    if (fresh) changeActiveSale(fresh)
    found.drop(product.id)
  }

  const onSale = new Set(
    activeSale?.productOnSale?.map((row) => row.productId) ?? []
  )
  const rows = found.rows.filter((product) => !onSale.has(product.id))

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {tx("Add products")}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {tx("Search by name or code, enter the sale price and click Add. It is saved right away.")}
      </p>
      <TextInput
        placeholder={tx("Name or code")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {found.searched && found.count === 0 && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {tx("No product found")}
        </p>
      )}
      {found.rows.length > 0 && (
        <div className="mt-2">
          <div
            className="grid gap-2 max-h-64 overflow-y-auto"
            onScroll={found.onScroll}
          >
            {rows.map((product) => (
              <SaleProductRow
                key={product.id}
                product={product}
                onAdd={(price) => add(product, price)}
              />
            ))}
          </div>
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
  )
}

export default SaleProductSearch
