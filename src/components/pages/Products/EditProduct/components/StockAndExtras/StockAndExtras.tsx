'use client'

import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Label, TextInput, ToggleSwitch } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI, ProductsAPI } from '@/services'
import { useCategoryStore, useProductsStore } from '@/store/store'
import { PRODUCT_ICONS } from '@/shared/helpers/productIcons'

const toNumber = (value: string) => (value.trim() === '' ? null : Number(value))

const StockAndExtras = () => {
  const { activeProduct, changeActiveProduct } = useProductsStore()
  const { fetchAllCategories, allCategories } = useCategoryStore()
  const product = activeProduct as any

  const [purchasePrice, setPurchasePrice] = useState('')
  const [warning, setWarning] = useState(String(product.lowStockWarning ?? ''))
  const [critical, setCritical] = useState(String(product.lowStockCritical ?? ''))
  const [sortPriority, setSortPriority] = useState(String(product.sortPriority ?? ''))
  const [isBackorder, setIsBackorder] = useState(Boolean(product.isBackorder))
  const [icons, setIcons] = useState<string[]>(product.icons ?? [])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAllCategories()
    BackofficeAPI.getProductCosts([product.id]).then((costs) => {
      if (costs?.[product.id] !== undefined) {
        setPurchasePrice(String(costs[product.id]))
      }
    })
    BackofficeAPI.getProductCategories(product.id).then((ids) => {
      if (ids) setCategoryIds(ids)
    })
  }, [fetchAllCategories, product.id])

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

  const save = async () => {
    const limits = [toNumber(warning), toNumber(critical), toNumber(sortPriority)]
    if (limits.some((value) => value !== null && !Number.isInteger(value))) {
      toast('Limits and position must be whole numbers', {
        type: 'error',
        autoClose: 2000,
      })
      return
    }

    setSaving(true)
    const body = {
      lowStockWarning: limits[0],
      lowStockCritical: limits[1],
      sortPriority: limits[2],
      isBackorder,
      icons,
    }
    const [updated, cost, categories] = await Promise.all([
      ProductsAPI.editProducts(product.id, body as any),
      BackofficeAPI.setProductCost(product.id, toNumber(purchasePrice)),
      BackofficeAPI.setProductCategories(product.id, categoryIds),
    ])
    setSaving(false)

    if (updated && cost && categories) {
      changeActiveProduct({ ...product, ...body })
      toast('Saved', { type: 'success', autoClose: 2000 })
    }
  }

  const categories = allCategories.filter(
    (category) =>
      category.id !== product.categoryId &&
      category.name.toLowerCase().includes(categoryFilter.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl pb-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="purchase-price" value="Purchase price (KM), staff only" />
          <TextInput
            id="purchase-price"
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sort-priority" value="Packing position, lowest first" />
          <TextInput
            id="sort-priority"
            type="number"
            value={sortPriority}
            onChange={(e) => setSortPriority(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="low-warning" value="Yellow alert at (pcs)" />
          <TextInput
            id="low-warning"
            type="number"
            min={0}
            value={warning}
            onChange={(e) => setWarning(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="low-critical" value="Red alert at (pcs)" />
          <TextInput
            id="low-critical"
            type="number"
            min={0}
            value={critical}
            onChange={(e) => setCritical(e.target.value)}
          />
        </div>
      </div>

      <ToggleSwitch
        checked={isBackorder}
        label="Made to order: the shop shows it as available by order only"
        onChange={setIsBackorder}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Icons shown in the shop
        </p>
        <div className="flex flex-wrap gap-4">
          {PRODUCT_ICONS.map(({ id, label }) => (
            <div key={id} className="flex items-center gap-2">
              <Checkbox
                id={`icon-${id}`}
                checked={icons.includes(id)}
                onChange={() => setIcons(toggle(icons, id))}
              />
              <Label htmlFor={`icon-${id}`} value={label} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Also show in these categories ({categoryIds.length})
        </p>
        <TextInput
          placeholder="Filter categories"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        />
        <div className="mt-2 grid gap-2 sm:grid-cols-2 max-h-64 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={categoryIds.includes(category.id)}
                onChange={() => setCategoryIds(toggle(categoryIds, category.id))}
              />
              <Label htmlFor={`category-${category.id}`} value={category.name} />
            </div>
          ))}
        </div>
      </div>

      <Button className="self-start" disabled={saving} onClick={save}>
        Save
      </Button>
    </div>
  )
}

export default StockAndExtras
