import InfoPages from '@/components/pages/Settings/InfoPages/InfoPages'
import React, { Suspense } from 'react'

const InfoPagesPage = () => {
  // the open page lives in the URL (?id=...), read on the client
  return (
    <Suspense>
      <InfoPages />
    </Suspense>
  )
}

export default InfoPagesPage
