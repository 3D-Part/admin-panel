'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import AttributesSearch from './AttributesSearch'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const AttributesHeader = () => {
  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.ATTRIBUTES_WRITE,
    currentUser?.role
  )

  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
      <AttributesSearch />
      {hasWritePermission && (
        <Button
          className="cursor-pointer"
          onClick={() => router.push(URLPartsEnum.AddNewAttribute)}
        >
          Add new <HiPlus className="ml-2" />
        </Button>
      )}
    </div>
  )
}
