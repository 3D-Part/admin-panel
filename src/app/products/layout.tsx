'use client'

import { useEffect } from 'react'
import { useProductsStore } from '@/store/store'

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { resetProductsState } = useProductsStore()

  // useEffect(() => {
  //   // Reset products state when navigating away from products section
  //   return () => {
  //     resetProductsState()
  //   }
  // }, [resetProductsState])

  return <>{children}</>
}
