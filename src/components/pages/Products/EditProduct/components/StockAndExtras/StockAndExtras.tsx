'use client'
import { tx } from '@/shared/i18n'
import SwitchCard from '@/components/common/SwitchCard/SwitchCard'

import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Label, TextInput } from 'flowbite-react'
import { toast } from 'react-toastify'
import { BackofficeAPI, ProductsAPI, SettingsAPI } from '@/services'
import { useCategoryStore, useProductsStore } from '@/store/store'
import {
  CUSTOM_ICON,
  ProductRibbon,
  customIconSrc,
  readProductRibbons,
} from '@/shared/helpers/productIcons'
import RibbonBadge from '@/components/common/RibbonBadge/RibbonBadge'
import { useEnterSave } from '@/shared/hooks/useEnterSave'
import ColorChoice from '@/components/common/ColorChoice/ColorChoice'

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
  const [highlightColor, setHighlightColor] = useState<string | null>(product.highlightColor ?? null)
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [ribbons, setRibbons] = useState<ProductRibbon[] | null>(null)

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
    SettingsAPI.getShopSettings().then((data) => setRibbons(readProductRibbons(data?.settings)))
  }, [fetchAllCategories, product.id])

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value]

  const save = async () => {
    const limits = [toNumber(warning), toNumber(critical), toNumber(sortPriority)]
    if (limits.some((value) => value !== null && !Number.isInteger(value))) {
      toast(tx("Limits and position must be whole numbers"), {
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
      highlightColor,
    }
    const [updated, cost, categories] = await Promise.all([
      ProductsAPI.editProducts(product.id, body as any),
      BackofficeAPI.setProductCost(product.id, toNumber(purchasePrice)),
      BackofficeAPI.setProductCategories(product.id, categoryIds),
    ])
    setSaving(false)

    if (updated && cost && categories) {
      changeActiveProduct({ ...product, ...body })
      toast(tx("Saved"), { type: 'success', autoClose: 2000 })
    }
  }

  const onEnter = useEnterSave(save, saving)

  const categories = allCategories.filter(
    (category) =>
      category.id !== product.categoryId &&
      category.name.toLowerCase().includes(categoryFilter.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-3xl pb-8" onKeyDown={onEnter}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="purchase-price" value={tx("Purchase price (KM), staff only")} />
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
          <Label htmlFor="sort-priority" value={tx("Packing position, lowest first")} />
          <TextInput
            id="sort-priority"
            type="number"
            value={sortPriority}
            onChange={(e) => setSortPriority(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="low-warning" value={tx("Yellow alert at (pcs)")} />
          <TextInput
            id="low-warning"
            type="number"
            min={0}
            value={warning}
            onChange={(e) => setWarning(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="low-critical" value={tx("Red alert at (pcs)")} />
          <TextInput
            id="low-critical"
            type="number"
            min={0}
            value={critical}
            onChange={(e) => setCritical(e.target.value)}
          />
        </div>
      </div>

      <SwitchCard
        title={tx('Made to order')}
        description={tx(
          'For products the shop orders from the supplier only when a customer buys them. Matters only when the stock is 0.'
        )}
        checked={isBackorder}
        onChange={setIsBackorder}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>{tx('At 0 pieces the shop shows:')}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isBackorder
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${isBackorder ? 'bg-amber-500' : 'bg-red-500'}`}
            />
            {isBackorder ? 'Po narudžbi' : 'Nema na stanju'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isBackorder
              ? tx('ordered from the supplier, longer delivery')
              : tx('can still be ordered, sent when the goods arrive')}
          </span>
        </div>
      </SwitchCard>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
          {tx('Highlight frame')}
        </p>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {tx("A thin frame in this color around the product's card in the shop, to make it stand out.")}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <ColorChoice value={highlightColor} onChange={setHighlightColor} allowNone />
          {/* how the card's edge looks in the shop */}
          <div
            className="h-14 w-11 rounded-lg bg-neutral-800"
            style={highlightColor ? { boxShadow: `0 0 0 2px ${highlightColor}, 0 0 14px ${highlightColor}66` } : undefined}
            title={tx('Preview')}
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">{tx('Ribbons')}</p>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          {tx("The card in the shop shows the product's ribbon that comes first in Settings → Ribbons, the product page all of them. Names, colors, icons and their order are set there.")}
        </p>
        {ribbons === null ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{tx('Loading...')}</p>
        ) : ribbons.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {tx('No ribbons yet.')}{' '}
            <a className="text-purple-600 hover:underline dark:text-purple-300" href="/settings/general?tab=ribbons">
              {tx('Settings → Ribbons')}
            </a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {ribbons.map((ribbon) => (
              <label key={ribbon.id} className="flex cursor-pointer items-center gap-2">
                <Checkbox checked={icons.includes(ribbon.id)} onChange={() => setIcons(toggle(icons, ribbon.id))} />
                <RibbonBadge ribbon={ribbon} />
              </label>
            ))}
          </div>
        )}
        {/* pictures uploaded on the product before there were ribbons */}
        {icons.some((icon) => icon.startsWith(CUSTOM_ICON)) && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {tx('Old icons of this product (click to remove):')}
            {icons
              .filter((icon) => icon.startsWith(CUSTOM_ICON))
              .map((icon) => (
                <button key={icon} type="button" title={tx('Remove this icon')} onClick={() => setIcons(toggle(icons, icon))}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={tx('Custom icon')}
                    className="h-8 w-8 rounded border border-gray-300 object-contain dark:border-gray-600"
                    src={customIconSrc(icon)}
                  />
                </button>
              ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Also show in these categories ({categoryIds.length})
        </p>
        <TextInput
          data-enter-ignore
          placeholder={tx("Filter categories")}
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
        {tx("Save")}
      </Button>
    </div>
  )
}

export default StockAndExtras
