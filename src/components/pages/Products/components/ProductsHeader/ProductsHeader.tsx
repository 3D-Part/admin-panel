'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { URLPartsEnum } from '@/shared/enums'
import ProductsSearch from './ProductsSearch'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const ProductsOverviewHeader = () => {
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.PRODUCT_WRITE,
    currentUser?.role
  )
  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
      <ProductsSearch />
      {hasWritePermission && (
        <Button href={URLPartsEnum.AddNewProduct}>
          Add new <HiPlus className="ml-2" />
        </Button>
      )}
    </div>
  )
}
