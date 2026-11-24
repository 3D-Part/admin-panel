'use client'

import { Badge, Button, Select, Table, TextInput } from 'flowbite-react'
import { Pagination } from '@/components/common/TablePagination/TablePagination'
import React, { useCallback, useEffect, useState } from 'react'
import { HiTag } from 'react-icons/hi'
import WarehouseAPI from '@/services/warehouse'
import { SaleDots } from '@/components/common/SaleMarks/SaleMarks'
import { tx } from '@/shared/i18n'
import { getStockLevel, stockLevelClasses } from '@/shared/helpers/warehouseLabels'
import { InventoryProduct, InventoryQuery } from '@/shared/types/warehouse'
import { Loader } from '@/components/common'
import Barcode from '../Barcode'

const PAGE_SIZES = [25, 50, 100]

type ProductInventoryProps = {
  onPrintLabels: (products: InventoryProduct[]) => void
}

/**
 * Every product with its stock and the barcode of its internal code, the one
 * the scanner reads. Select rows to print their stickers.
 */
const ProductInventory: React.FC<ProductInventoryProps> = ({ onPrintLabels }) => {
  const [search, setSearch] = useState('')
  const [stock, setStock] = useState<InventoryQuery['stock']>('')
  const [published, setPublished] = useState<InventoryQuery['published']>('')
  const [sort, setSort] = useState<InventoryQuery['sort']>('code')
  const [pageSize, setPageSize] = useState(25)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<InventoryProduct[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  // kept across pages, so stickers can be collected from several pages
  const [selected, setSelected] = useState<Map<string, InventoryProduct>>(new Map())

  const load = useCallback(async () => {
    setLoading(true)
    const data = await WarehouseAPI.getInventory({
      search: search.trim() || undefined,
      stock: stock || undefined,
      published: published || undefined,
      sort,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    })
    setLoading(false)
    if (!data) return
    setRows(data.rows)
    setCount(data.count)
  }, [search, stock, published, sort, page, pageSize])

  // typing waits a moment so every key does not fire a request
  useEffect(() => {
    const timeout = setTimeout(load, 300)
    return () => clearTimeout(timeout)
  }, [load])

  // a new filter starts again from the first page
  useEffect(() => {
    setPage(1)
  }, [search, stock, published, sort, pageSize])

  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const allOnPage = rows.length > 0 && rows.every((row) => selected.has(row.id))

  const toggle = (product: InventoryProduct) => {
    const next = new Map(selected)
    if (next.has(product.id)) next.delete(product.id)
    else next.set(product.id, product)
    setSelected(next)
  }

  const togglePage = (checked: boolean) => {
    const next = new Map(selected)
    rows.forEach((row) => (checked ? next.set(row.id, row) : next.delete(row.id)))
    setSelected(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TextInput
          className="flex-1 min-w-[14rem]"
          value={search}
          placeholder={tx('Name, code, SKU or EAN')}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          aria-label={tx('Stock')}
          value={stock}
          onChange={(e) => setStock(e.target.value as InventoryQuery['stock'])}
        >
          <option value="">{tx('All stock levels')}</option>
          <option value="out">{tx('Out of stock')}</option>
          <option value="critical">{tx('At the red limit')}</option>
          <option value="warning">{tx('At the yellow limit')}</option>
        </Select>
        <Select
          aria-label={tx('Published')}
          value={published}
          onChange={(e) => setPublished(e.target.value as InventoryQuery['published'])}
        >
          <option value="">{tx('Published and hidden')}</option>
          <option value="yes">{tx('Published')}</option>
          <option value="no">{tx('Hidden')}</option>
        </Select>
        <Select
          aria-label={tx('Sort')}
          value={sort}
          onChange={(e) => setSort(e.target.value as InventoryQuery['sort'])}
        >
          <option value="code">{tx('Code')}</option>
          <option value="name">{tx('Name A-Z')}</option>
          <option value="quantity-asc">{tx('Quantity: Low to High')}</option>
          <option value="quantity-desc">{tx('Quantity: High to Low')}</option>
        </Select>
        <Button
          color="light"
          disabled={selected.size === 0}
          onClick={() => onPrintLabels(Array.from(selected.values()))}
        >
          <HiTag className="w-4 h-4 mr-1" />
          {tx('Labels ({count})', { count: selected.size })}
        </Button>
        {selected.size > 0 && (
          <Button color="gray" onClick={() => setSelected(new Map())}>
            {tx('Clear selection')}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="w-8">
              <input
                type="checkbox"
                aria-label={tx('Select all')}
                checked={allOnPage}
                onChange={(e) => togglePage(e.target.checked)}
              />
            </Table.HeadCell>
            <Table.HeadCell>{tx('Barcode')}</Table.HeadCell>
            <Table.HeadCell>{tx('Product')}</Table.HeadCell>
            <Table.HeadCell>SKU / EAN</Table.HeadCell>
            <Table.HeadCell>{tx('Price')}</Table.HeadCell>
            <Table.HeadCell>{tx('In stock')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {rows.map((product) => {
              const level = getStockLevel(product)
              return (
                <Table.Row
                  key={product.id}
                  className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                  onClick={() => toggle(product)}
                >
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      aria-label={product.code}
                      checked={selected.has(product.id)}
                      onChange={() => toggle(product)}
                    />
                  </Table.Cell>
                  <Table.Cell className="w-48">
                    {product.code ? (
                      <Barcode
                        value={product.code}
                        height={40}
                        className="w-44 h-auto bg-white rounded"
                      />
                    ) : (
                      '—'
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-gray-900 dark:text-white">
                    <SaleDots productId={product.id} className="mr-1.5" />
                    {product.name}
                    <span className="block text-xs text-gray-500">
                      {[product.category?.name, product.manufacturer?.name]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <span className="flex gap-1 mt-1">
                      {!product.isPublished && (
                        <Badge color="gray" className="w-fit">
                          {tx('Hidden')}
                        </Badge>
                      )}
                      {product.isBackorder && (
                        <Badge color="purple" className="w-fit">
                          {tx('Backorder')}
                        </Badge>
                      )}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="font-mono text-xs whitespace-nowrap">
                    {product.sku || '—'}
                    <span className="block text-gray-500">{product.ean || ''}</span>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">
                    {Number(product.price).toFixed(2)} KM
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      className={`inline-block px-2 py-0.5 rounded border font-semibold ${stockLevelClasses[level]}`}
                    >
                      {product.quantity}
                    </span>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
        {loading && <Loader />}
        {!loading && rows.length === 0 && (
          <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
            {tx('No product found')}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          showIcons
        />
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{tx('Total: {count}', { count })}</span>
          <Select
            sizing="sm"
            aria-label={tx('Per page')}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {tx('{size} per page', { size })}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}

export default ProductInventory
