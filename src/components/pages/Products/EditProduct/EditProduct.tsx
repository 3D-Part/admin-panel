'use client'

import React, { useEffect } from 'react'
import { useProductsStore, useUISliceStore } from '@/store/store'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { TabsMenu } from './components/TabsMenu/TabsMenu'

export const EditProduct = () => {
  const { activeProduct } = useProductsStore()

  const { changeIsAddProductsOnSaleModalOpen } = useUISliceStore()

  const test = () => {
    changeIsAddProductsOnSaleModalOpen(true)
  }

  const router = useRouter()

  useEffect(() => {
    if (activeProduct.id) return

    router.push(URLPartsEnum.Products)
  }, [activeProduct, router])

  return (
    <div className="w-full">
      <div className="w-full flex-wrap flex justify-between gap-4 items-center mb-12 ">
        <h2 className="text-white text-4xl font-bold">{activeProduct.name}</h2>
        <div className="flex items-center gap-4">
          <Button color="purple" onClick={test}>
            Add on sale <HiPlus className="ml-2" />
          </Button>
          <Button href={URLPartsEnum.AddNewProduct}>
            Add new <HiPlus className="ml-2" />
          </Button>
        </div>
      </div>
      <TabsMenu />
    </div>
  )
}
