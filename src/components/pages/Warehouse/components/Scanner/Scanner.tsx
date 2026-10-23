'use client'

import { Button, Spinner, TextInput } from 'flowbite-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { HiCamera } from 'react-icons/hi'
import WarehouseAPI from '@/services/warehouse'
import { Asset, ScanResult, WarehouseProduct } from '@/shared/types/warehouse'
import { usCharForKey } from './scannerKeys'
import CameraScanner from './CameraScanner'
import ProductResult from './ProductResult'
import AssetResult from './AssetResult'
import UnknownCode from './UnknownCode'

type ScannerProps = {
  onPrintProduct: (product: WarehouseProduct) => void
  onPrintAsset: (asset: Asset) => void
}

const isTypingTarget = (element: Element | null) =>
  !!element &&
  (element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'SELECT' ||
    (element as HTMLElement).isContentEditable)

const Scanner: React.FC<ScannerProps> = ({ onPrintProduct, onPrintAsset }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  // SKU is shared by several products; the employee picks one
  const [picked, setPicked] = useState<WarehouseProduct | Asset | null>(null)

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const lookup = useCallback(
    async (raw: string) => {
      const code = raw.trim()
      if (!code) return
      setLoading(true)
      setPicked(null)
      const data = await WarehouseAPI.scan(code)
      setLoading(false)
      setValue('')
      if (data) {
        setResult(data)
        const total = data.products.length + data.assets.length
        if (total === 1) {
          setPicked(data.products[0] ?? data.assets[0])
        }
      }
      focusInput()
    },
    [focusInput]
  )

  // A USB scanner types into whatever has focus. When nothing editable has
  // it (e.g. right after clicking a button), send the keys to the scan field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isTypingTarget(document.activeElement)) return
      if (e.key.length !== 1) return
      const char = usCharForKey(e.code, e.shiftKey) ?? e.key
      e.preventDefault()
      inputRef.current?.focus()
      setValue((current) => current + char)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    focusInput()
  }, [focusInput])

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      lookup(value)
      return
    }
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return

    const char = usCharForKey(e.code, e.shiftKey)
    if (char && char !== e.key) {
      e.preventDefault()
      const input = e.currentTarget
      const start = input.selectionStart ?? value.length
      const end = input.selectionEnd ?? value.length
      setValue(value.slice(0, start) + char + value.slice(end))
    }
  }

  const isProduct = (item: WarehouseProduct | Asset): item is WarehouseProduct =>
    'sku' in item

  const total = result ? result.products.length + result.assets.length : 0

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          lookup(value)
        }}
      >
        <TextInput
          ref={inputRef}
          className="flex-1 min-w-[14rem]"
          sizing="lg"
          value={value}
          autoComplete="off"
          placeholder="Skenirajte ili upišite šifru, EAN ili SKU"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onInputKeyDown}
        />
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Traži'}
        </Button>
        <Button
          type="button"
          size="lg"
          color="gray"
          onClick={() => setCameraOpen((open) => !open)}
        >
          <HiCamera className="w-5 h-5 mr-2" />
          Kamera
        </Button>
      </form>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        USB čitač radi odmah, samo skenirajte. Na telefonu koristite dugme
        Kamera.
      </p>

      {cameraOpen && (
        <CameraScanner
          onDetected={(code) => {
            setCameraOpen(false)
            lookup(code)
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {result && total === 0 && (
        <UnknownCode
          key={result.code}
          code={result.code}
          onAssigned={() => lookup(result.code)}
        />
      )}

      {result && total > 1 && !picked && (
        <div className="flex flex-col gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-900 dark:text-white">
            Za kod{' '}
            <span className="font-mono text-gray-600 dark:text-gray-300">
              {result.code}
            </span>{' '}
            pronađeno: {total}. Izaberite:
          </p>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...result.products, ...result.assets].map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full flex gap-3 px-2 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setPicked(item)}
                >
                  <span className="font-mono text-gray-600 dark:text-gray-300">{item.code}</span>
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {item.name}
                  </span>
                  {isProduct(item) && (
                    <span className="text-gray-500">{item.quantity} kom</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && picked && (
        <>
          {total > 1 && (
            <button
              type="button"
              className="self-start text-sm text-blue-600 hover:underline"
              onClick={() => setPicked(null)}
            >
              ← nazad na listu ({total})
            </button>
          )}
          {isProduct(picked) ? (
            <ProductResult
              key={picked.id}
              product={picked}
              scannedCode={result.code}
              onDone={focusInput}
              onPrintLabel={onPrintProduct}
            />
          ) : (
            <AssetResult
              key={picked.id}
              asset={picked}
              onDone={focusInput}
              onPrintLabel={onPrintAsset}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Scanner
