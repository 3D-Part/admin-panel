'use client'

import { Button, Checkbox, Label, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiPrinter, HiTrash } from 'react-icons/hi'
import WarehouseAPI from '@/services/warehouse'
import {
  Asset,
  LabelItem,
  WarehouseProduct,
} from '@/shared/types/warehouse'
import Barcode from '../Barcode'
import { LABEL_FORMATS, LabelFormat } from './labelFormats'

export const productLabel = (product: WarehouseProduct): LabelItem => ({
  key: product.id,
  code: product.code,
  name: product.name,
  price: product.price,
  copies: 1,
})

export const assetLabel = (asset: Asset): LabelItem => ({
  key: asset.id,
  code: asset.code,
  name: asset.name,
  copies: 1,
})

type LabelsProps = {
  items: LabelItem[]
  setItems: (items: LabelItem[]) => void
}

type SearchHit = { item: LabelItem; kind: 'Product' | 'Inventory' }

const STORAGE_KEY = 'warehouse.labelFormat'

const LabelView: React.FC<{
  item: LabelItem | null
  format: LabelFormat
  showName: boolean
  showPrice: boolean
}> = ({ item, format, showName, showPrice }) => (
  <div
    className="label-cell"
    style={{ width: `${format.width}mm`, height: `${format.height}mm` }}
  >
    {item && (
      <>
        {showName && <div className="label-name">{item.name}</div>}
        <Barcode value={item.code} className="label-barcode" />
        {showPrice && item.price != null && (
          <div className="label-price">{Number(item.price).toFixed(2)} KM</div>
        )}
      </>
    )}
  </div>
)

const Labels: React.FC<LabelsProps> = ({ items, setItems }) => {
  const [formatId, setFormatId] = useState(LABEL_FORMATS[0].id)
  const [skip, setSkip] = useState(0)
  const [showName, setShowName] = useState(true)
  const [showPrice, setShowPrice] = useState(false)
  const [search, setSearch] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && LABEL_FORMATS.some((format) => format.id === saved)) {
        setFormatId(saved)
      }
    } catch {
      // storage blocked: keep the default
    }
  }, [])

  const format = LABEL_FORMATS.find((f) => f.id === formatId)!
  const isSheet = format.columns * format.rows > 1

  useEffect(() => {
    if (search.trim().length < 2) {
      setHits([])
      return
    }
    const timeout = setTimeout(async () => {
      const [products, assets] = await Promise.all([
        WarehouseAPI.searchProducts(search, 15),
        WarehouseAPI.getAssets({ search, limit: 15 }),
      ])
      setHits([
        ...products.map((p) => ({ item: productLabel(p), kind: 'Product' as const })),
        ...(assets?.rows ?? []).map((a) => ({
          item: assetLabel(a),
          kind: 'Inventory' as const,
        })),
      ])
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const add = (item: LabelItem) => {
    const existing = items.find((i) => i.key === item.key)
    setItems(
      existing
        ? items.map((i) =>
            i.key === item.key ? { ...i, copies: i.copies + 1 } : i
          )
        : [...items, item]
    )
  }

  const setCopies = (key: string, copies: number) =>
    setItems(
      items.map((i) =>
        i.key === key ? { ...i, copies: Math.max(1, copies || 1) } : i
      )
    )

  // every printed position: skipped blanks first, then each copy
  const cells = useMemo(() => {
    const list: (LabelItem | null)[] = isSheet
      ? Array.from({ length: skip }, () => null)
      : []
    items.forEach((item) => {
      for (let i = 0; i < item.copies; i++) list.push(item)
    })
    return list
  }, [items, skip, isSheet])

  const perPage = format.columns * format.rows
  const pages = useMemo(() => {
    const result: (LabelItem | null)[][] = []
    for (let i = 0; i < cells.length; i += perPage) {
      result.push(cells.slice(i, i + perPage))
    }
    return result
  }, [cells, perPage])

  const printedCount = cells.filter(Boolean).length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <TextInput
            value={search}
            placeholder="Add: name, code or SKU of a product or item"
            onChange={(e) => setSearch(e.target.value)}
          />
          {hits.length > 0 && (
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded">
              {hits.map(({ item, kind }) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className="w-full flex gap-3 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => add(item)}
                  >
                    <span className="font-mono text-gray-600 dark:text-gray-300">{item.code}</span>
                    <span className="flex-1 text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500">{kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            To print ({printedCount} pcs)
          </h3>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add products with the search above, or send them from Scanner and Inventory with the Label button.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-2 text-sm">
                  <span className="font-mono text-gray-600 dark:text-gray-300">{item.code}</span>
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                  <TextInput
                    type="number"
                    min={1}
                    sizing="sm"
                    className="w-20"
                    aria-label="Quantity"
                    value={item.copies}
                    onChange={(e) => setCopies(item.key, Number(e.target.value))}
                  />
                  <button
                    type="button"
                    aria-label="Remove"
                    className="text-gray-500 hover:text-red-600"
                    onClick={() => setItems(items.filter((i) => i.key !== item.key))}
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="label-format" value="Format" />
            <Select
              id="label-format"
              value={formatId}
              onChange={(e) => {
                setFormatId(e.target.value)
                try {
                  localStorage.setItem(STORAGE_KEY, e.target.value)
                } catch {
                  // not remembered, nothing else breaks
                }
              }}
            >
              {LABEL_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </div>
          {isSheet && (
            <div className="w-56">
              <Label
                htmlFor="label-skip"
                value="Skip first (already used)"
              />
              <TextInput
                id="label-skip"
                type="number"
                min={0}
                max={perPage - 1}
                value={skip}
                onChange={(e) =>
                  setSkip(
                    Math.min(perPage - 1, Math.max(0, Number(e.target.value) || 0))
                  )
                }
              />
            </div>
          )}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="label-name"
                checked={showName}
                onChange={(e) => setShowName(e.target.checked)}
              />
              <Label htmlFor="label-name" value="Name" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="label-price"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
              />
              <Label htmlFor="label-price" value="Price" />
            </div>
          </div>
          <Button
            disabled={printedCount === 0}
            onClick={() => window.print()}
            className="self-start"
          >
            <HiPrinter className="w-5 h-5 mr-2" />
            Print
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            In the print dialog: margins <b>None</b>, scale{' '}
            <b>100%</b>
            {!isSheet && ', paper the same size as the label'}.
          </p>
        </div>
      </div>

      {printedCount > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Preview
          </h3>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto">
            {cells
              .filter(Boolean)
              .slice(0, 12)
              .map((item, index) => (
                <div key={index} className="label-preview shadow">
                  <LabelView
                    item={item}
                    format={format}
                    showName={showName}
                    showPrice={showPrice}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {mounted &&
        createPortal(
          <div className="label-print-root">
            <style>{`
              .label-cell {
                box-sizing: border-box;
                padding: 1.5mm 2mm;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.5mm;
                overflow: hidden;
                background: #fff;
                color: #000;
                font-family: Arial, Helvetica, sans-serif;
              }
              .label-name {
                width: 100%;
                font-size: ${format.height < 28 ? 6.5 : 8}pt;
                line-height: 1.15;
                font-weight: 600;
                text-align: center;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
              .label-barcode { width: 100%; min-height: 0; flex: 1 1 auto; }
              .label-price { font-size: 8pt; font-weight: 700; }
              .label-page {
                display: grid;
                grid-template-columns: repeat(${format.columns}, ${format.width}mm);
                grid-auto-rows: ${format.height}mm;
                break-after: page;
              }
              .label-page:last-child { break-after: auto; }
              @media screen { .label-print-root { display: none; } }
              @media print {
                @page { size: ${format.pageSize}; margin: ${format.pageMargin}; }
                html, body { margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; background: #fff !important; }
                body > *:not(.label-print-root) { display: none !important; }
                .label-print-root { display: block; }
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            `}</style>
            {pages.map((page, pageIndex) => (
              <div key={pageIndex} className="label-page">
                {page.map((item, index) => (
                  <LabelView
                    key={index}
                    item={item}
                    format={format}
                    showName={showName}
                    showPrice={showPrice}
                  />
                ))}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}

export default Labels
