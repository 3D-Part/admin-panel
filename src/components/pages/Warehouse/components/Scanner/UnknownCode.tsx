'use client'

import { Button, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import WarehouseAPI from '@/services/warehouse'
import { WarehouseProduct } from '@/shared/types/warehouse'

type UnknownCodeProps = {
  code: string
  onAssigned: () => void
}

// our own codes: P000123 (products), INV000123 (assets)
const INTERNAL_CODE = /^(P|INV)\d{6,}$/i

/**
 * Nothing has this code. A manufacturer's barcode (EAN on the box) can be
 * attached to a product here, so the next scan of the same box finds it.
 */
const UnknownCode: React.FC<UnknownCodeProps> = ({ code, onAssigned }) => {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<WarehouseProduct[]>([])
  const isInternal = INTERNAL_CODE.test(code)

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setResults(await WarehouseAPI.searchProducts(search, 10))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const assign = async (product: WarehouseProduct) => {
    const updated = await WarehouseAPI.assignEan(product.id, code)
    if (updated) {
      toast(`Barcode ${code} assigned to product ${product.code}`, {
        type: 'success',
        autoClose: 2500,
      })
      onAssigned()
    }
  }

  return (
    <div className="flex flex-col gap-3 p-4 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
      <p className="text-sm text-gray-900 dark:text-white">
        Nothing found for <span className="font-mono font-semibold">{code}</span>.
      </p>

      {isInternal ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This looks like our code, but no such product or item exists. It may have been deleted.
        </p>
      ) : (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If this is a manufacturer barcode, find the product it belongs to and the next scan will find it right away.
          </p>
          <TextInput
            value={search}
            placeholder="product name, code or SKU"
            onChange={(e) => setSearch(e.target.value)}
          />
          {results.length > 0 && (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded">
              {results.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-gray-600 dark:text-gray-300">{product.code}</span>
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {product.name}
                  </span>
                  {product.ean && (
                    <span className="text-xs text-gray-500">
                      has EAN {product.ean}
                    </span>
                  )}
                  <Button size="xs" onClick={() => assign(product)}>
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

export default UnknownCode
