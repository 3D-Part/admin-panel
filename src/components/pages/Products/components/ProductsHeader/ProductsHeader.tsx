'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { URLPartsEnum } from '@/shared/enums'
import ProductsSearch from './ProductsSearch'
import ProductsSort from './ProductsSort'
import ProductsFlagFilter from './ProductsFlagFilter'
import { ExportButton } from '@/components/common'
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
    <div className="w-full flex flex-wrap md:flex-nowrap justify-between items-center gap-2 md:gap-4 z-20">
      <div className="w-full md:w-auto md:flex-1 min-w-0">
        <ProductsSearch />
      </div>
      <ProductsFlagFilter />
      <ProductsSort />
      <ExportButton kind="products" />
      {hasWritePermission && (
        <Button
          href={URLPartsEnum.AddNewProduct}
          size="sm"
          className="shrink-0 py-1"
          color="purple"
        >
          <HiPlus className="mr-1 md:mr-2" />
          <span className="hidden sm:inline">{tx("Add new")}</span>
        </Button>
      )}
    </div>
  )
}
