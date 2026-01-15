'use client'

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import { useUISliceStore, useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const SalesHeader = () => {
  const router = useRouter()

  const { changeIsSaleAddNewModalOpen } = useUISliceStore()
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.SALE_WRITE,
    currentUser?.role
  )

  return (
    <div className="w-full flex justify-end items-center flex-wrap gap-4">
      {/* <ManufacturesSearch /> */}
      {hasWritePermission && (
        <Button
          className="cursor-pointer"
          onClick={() => changeIsSaleAddNewModalOpen(true)}
          color="purple"
        >
          Add new <HiPlus className="ml-2" />
        </Button>
      )}
    </div>
  )
}
