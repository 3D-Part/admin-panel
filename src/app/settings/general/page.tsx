import GeneralSettings from '@/components/pages/Settings/General/GeneralSettings'
import React, { Suspense } from 'react'

const GeneralSettingsPage = () => {
  // the open section lives in the URL (?tab=banner), read on the client
  return (
    <Suspense>
      <GeneralSettings />
    </Suspense>
  )
}

export default GeneralSettingsPage
