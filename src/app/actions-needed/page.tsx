import React, { Suspense } from 'react'
import ActionsNeeded from '@/components/pages/ActionsNeeded/ActionsNeeded'

export default function ActionsNeededPage() {
  // the active tab lives in the URL (?tab=stock), read on the client
  return (
    <Suspense>
      <ActionsNeeded />
    </Suspense>
  )
}
