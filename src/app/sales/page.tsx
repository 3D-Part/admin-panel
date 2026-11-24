import { Sales } from '@/components/pages/Sales/Sales'
import React, { Suspense } from 'react'

const SalePage = () => {
  // ?sale=<id> is read on the client
  return (
    <Suspense>
      <Sales />
    </Suspense>
  )
}

export default SalePage
