'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import CategoriesSearch from './CategoriesSearch'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const CategoriesHeader = () => {
  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.CATEGORY_WRITE,
    currentUser?.role
  )

  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
      <CategoriesSearch />
      {hasWritePermission && (
        <Button
          className="cursor-pointer"
          onClick={() => router.push(URLPartsEnum.AddNewCategory)}
          color="purple"
        >
          Add new <HiPlus className="ml-2" />
        </Button>
      )}
    </div>
  )
}
