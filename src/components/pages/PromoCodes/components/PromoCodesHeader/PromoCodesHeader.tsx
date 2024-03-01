'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import ManufacturesSearch from './PromoCodesSearch'

export const PromoCodesHeader = () => {
  const router = useRouter()

  return (
    <div className="w-full flex justify-between items-center">
      <ManufacturesSearch />
      <Button
        className="cursor-pointer"
        onClick={() => router.push(URLPartsEnum.AddNewManufacturer)}
      >
        Add new <HiPlus className="ml-2" />
      </Button>
    </div>
  )
}
