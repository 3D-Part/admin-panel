'use client'

import { Badge, Button, Label, TextInput } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import WarehouseAPI from '@/services/warehouse'
import {
  getStockLevel,
  movementLabels,
  stockLevelClasses,
} from '@/shared/helpers/warehouseLabels'
import {
  ProductMovementType,
  StockMovement,
  WarehouseProduct,
} from '@/shared/types/warehouse'
import MovementList from '../MovementList'

const S3_URL = process.env.S3_URL

const MOVEMENTS: ProductMovementType[] = ['IN', 'OUT', 'RETURN', 'INVENTORY']

type ProductResultProps = {
  product: WarehouseProduct
  scannedCode: string
  onDone: () => void
  onPrintLabel: (product: WarehouseProduct) => void
}

const ProductResult: React.FC<ProductResultProps> = ({
  product: initialProduct,
  scannedCode,
  onDone,
  onPrintLabel,
}) => {
  const [product, setProduct] = useState(initialProduct)
  const [type, setType] = useState<ProductMovementType>('IN')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [movements, setMovements] = useState<StockMovement[]>([])

  const loadMovements = useCallback(async () => {
    const data = await WarehouseAPI.getMovements({
      productId: initialProduct.id,
      limit: 10,
    })
    setMovements(data?.rows ?? [])
  }, [initialProduct.id])

  useEffect(() => {
    setProduct(initialProduct)
    loadMovements()
  }, [initialProduct, loadMovements])

  useEffect(() => {
    // inventory starts from the current count, the others from one piece
    setQuantity(type === 'INVENTORY' ? String(product.quantity ?? 0) : '1')
  }, [type]) // eslint-disable-line react-hooks/exhaustive-deps

  const level = getStockLevel(product)
  const image = product.images?.[0]?.imageId
  const scannedEan =
    scannedCode !== product.code &&
    scannedCode !== product.sku &&
    scannedCode === product.ean

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(quantity)
    if (!Number.isInteger(amount) || amount < (type === 'INVENTORY' ? 0 : 1)) {
      toast('Unesite ispravnu količinu', { type: 'error', autoClose: 2000 })
      return
    }

    setSaving(true)
    const result = await WarehouseAPI.moveProductStock(product.id, {
      type,
      quantity: amount,
      note: note || undefined,
    })
    setSaving(false)

    if (result) {
      setProduct({ ...product, quantity: result.product.quantity })
      setNote('')
      toast(
        `${movementLabels[type]} upisan — stanje ${result.product.quantity} kom`,
        { type: 'success', autoClose: 2000 }
      )
      loadMovements()
      onDone()
    }
  }

  const removeEan = async () => {
    const updated = await WarehouseAPI.assignEan(product.id, null)
    if (updated) {
      setProduct({ ...product, ean: null })
      toast('Bar kod proizvođača uklonjen', { type: 'success', autoClose: 2000 })
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex gap-4">
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${S3_URL}/${image}`}
            alt=""
            className="w-20 h-20 object-contain rounded bg-gray-50 dark:bg-gray-700"
          />
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-mono font-semibold">{product.code}</span>
            <span>SKU {product.sku}</span>
            {product.ean && (
              <span>
                EAN {product.ean}{' '}
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={removeEan}
                >
                  ukloni
                </button>
              </span>
            )}
            <span>{Number(product.price).toFixed(2)} KM</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {!product.isPublished && <Badge color="gray">Nije objavljen</Badge>}
            {scannedEan && <Badge color="info">Pronađen po EAN-u</Badge>}
          </div>
        </div>
        <div
          className={`ml-auto shrink-0 flex flex-col items-center justify-center px-4 rounded-lg border ${stockLevelClasses[level]}`}
        >
          <span className="text-3xl font-bold">{product.quantity ?? 0}</span>
          <span className="text-xs">na stanju</span>
        </div>
      </div>

      {(product.lowStockWarning != null || product.lowStockCritical != null) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Granice: žuto na {product.lowStockWarning ?? '—'} kom, crveno na{' '}
          {product.lowStockCritical ?? '—'} kom
        </p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {MOVEMENTS.map((movement) => (
            <Button
              key={movement}
              type="button"
              size="sm"
              color={type === movement ? 'info' : 'gray'}
              onClick={() => setType(movement)}
            >
              {movementLabels[movement]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-32">
            <Label
              htmlFor="movement-quantity"
              value={type === 'INVENTORY' ? 'Izbrojano kom' : 'Količina'}
            />
            <TextInput
              id="movement-quantity"
              type="number"
              min={type === 'INVENTORY' ? 0 : 1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[12rem]">
            <Label htmlFor="movement-note" value="Napomena (nije obavezno)" />
            <TextInput
              id="movement-note"
              value={note}
              maxLength={500}
              placeholder={
                type === 'OUT'
                  ? 'npr. oštećeno, za radionicu'
                  : type === 'IN'
                  ? 'npr. dobavljač, broj fakture'
                  : ''
              }
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            Potvrdi {movementLabels[type].toLowerCase()}
          </Button>
          <Button
            type="button"
            color="light"
            onClick={() => onPrintLabel(product)}
          >
            Etiketa
          </Button>
        </div>
      </form>

      <div>
        <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
          Istorija
        </h4>
        <MovementList movements={movements} />
      </div>
    </div>
  )
}

export default ProductResult
