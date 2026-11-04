'use client'

import React from 'react'
import { ToggleSwitch } from 'flowbite-react'
import { useUsersSliceStore } from '@/store/store'
import UsersSearch from './UsersSearch'
import UsersSort from './UsersSort'
import { ExportButton } from '@/components/common'

export const UsersHeader = () => {
  const { disputedOnly, changeDisputedOnly, changeCurrentPage, fetchUsers, itemsPerPage } =
    useUsersSliceStore()

  return (
    <div className="w-full flex justify-between items-center gap-2 md:gap-4 z-20">
      <div className="flex-1 min-w-0">
        <UsersSearch />
      </div>
      <ToggleSwitch
        checked={disputedOnly}
        label="Disputed only"
        onChange={(value) => {
          changeDisputedOnly(value)
          changeCurrentPage(1)
          fetchUsers({ offset: 0, limit: itemsPerPage })
        }}
      />
      <UsersSort />
      <ExportButton kind="customers" />
    </div>
  )
}
