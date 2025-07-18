'use client' // This is a client component 👈🏽

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { URLPartsEnum } from '@/shared/enums'
import AttributesSearch from './AttributesSearch'

export const AttributesHeader = () => {
  const router = useRouter()

  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
      <AttributesSearch />
      <Button
        className="cursor-pointer"
        onClick={() => router.push(URLPartsEnum.AddNewAttribute)}
      >
        Add new <HiPlus className="ml-2" />
      </Button>
    </div>
  )
}
