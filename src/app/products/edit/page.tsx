import { Suspense } from 'react'
import { EditProduct } from '@/components/pages/Products/EditProduct/EditProduct'

export default function EditProductPage() {
  return (
    <>
      <Suspense>
        <EditProduct />
      </Suspense>
    </>
  )
}
