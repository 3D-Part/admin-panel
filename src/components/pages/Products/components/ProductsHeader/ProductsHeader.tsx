'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { URLPartsEnum } from '@/shared/enums'
import { Search } from '@/components/common'
import ProductsSearch from './ProductsSearch'

export const ProductsOverviewHeader = () => {
  return (
    <div className="w-full flex justify-between items-center">
      <ProductsSearch />
      <Button href={URLPartsEnum.AddNewProduct}>
        Add new <HiPlus className="ml-2" />
      </Button>
    </div>
  )
}
