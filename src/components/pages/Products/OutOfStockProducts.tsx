'use client'

import React, { useEffect, useState } from 'react'
import { useProductsStore } from '@/store/store'
import { Products } from './Products'

export const OutOfStockProducts = () => {
  const [isReady, setIsReady] = useState(false)
  const { changeOnlyOutOfStock, changeCurrentPage } = useProductsStore()

  useEffect(() => {
    changeOnlyOutOfStock(true)
    changeCurrentPage(1)
    setIsReady(true)

    return () => {
      changeOnlyOutOfStock(false)
      changeCurrentPage(1)
    }
  }, [changeOnlyOutOfStock, changeCurrentPage])

  // The table fetches on mount, so it has to wait for the filter
  return isReady ? <Products /> : null
}
