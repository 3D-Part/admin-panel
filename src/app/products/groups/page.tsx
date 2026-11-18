import { Suspense } from 'react'
import ProductGroups from '@/components/pages/Products/ProductGroups/ProductGroups'

export default function ProductGroupsPage() {
  return (
    <Suspense>
      <ProductGroups />
    </Suspense>
  )
}
