import React, { Suspense } from 'react'
import Proformas from '@/components/pages/Proformas/Proformas'

export default function ProformasPage() {
  // ?new=1 opens the form, read on the client
  return (
    <Suspense>
      <Proformas />
    </Suspense>
  )
}
