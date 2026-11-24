'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import { HiMail } from 'react-icons/hi'
import OrderEmailsSearch from './OrderEmailsSearch'
import OrderEmailDrafts from '../OrderEmailDrafts/OrderEmailDrafts'
import { useCurrentUserStore, useOrdersEmailsStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const OrderEmailsHeader = () => {
  const [writing, setWriting] = useState(false)
  const { currentUser } = useCurrentUserStore()
  const { emailsFilters } = useOrdersEmailsStore()
  const canWrite = hasPermission(currentUser?.permissions, PermissionEnum.ORDERS_WRITE, currentUser?.role)
  // the search of the list ("%gmail%") is offered as the filter of the e-mail
  const like: string = (emailsFilters as any)?.filters?.email?.like ?? ''
  const search = like.replace(/^%|%$/g, '')

  return (
    <div className="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-2 md:gap-4 z-20">
      <div className="w-full md:w-auto md:flex-1 min-w-0">
        <OrderEmailsSearch />
      </div>
      {canWrite && (
        <Button color="purple" className="w-full md:w-auto" onClick={() => setWriting(true)}>
          <HiMail className="mr-2 h-5 w-5" />
          {tx('Write to customers')}
        </Button>
      )}
      <OrderEmailDrafts isOpen={writing} onClose={() => setWriting(false)} search={search} />
    </div>
  )
}
