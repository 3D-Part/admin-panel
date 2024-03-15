'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import ManufacturesSearch from './UsersSearch'

export const UsersHeader = () => {
  const router = useRouter()

  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
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
