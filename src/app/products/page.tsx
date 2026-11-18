import React, { Suspense } from 'react'
import { Products } from '@/components/pages/Products/Products'

export default function ProductsPage() {
  // ?key=, ?categoryId= and ?manufacturerId= are read on the client
  return (
    <Suspense>
      <Products />
    </Suspense>
  )
}
