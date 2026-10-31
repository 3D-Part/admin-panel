import Warehouse from '@/components/pages/Warehouse/Warehouse'
import React, { Suspense } from 'react'

const WarehousePage = () => {
  // the active tab lives in the URL (?tab=scanner), read on the client
  return (
    <Suspense>
      <Warehouse />
    </Suspense>
  )
}

export default WarehousePage
