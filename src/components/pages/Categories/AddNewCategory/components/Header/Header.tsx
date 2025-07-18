'use client'

import { URLPartsEnum } from '@/shared/enums'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { HiArrowCircleLeft } from 'react-icons/hi'

const CategoryHeader = () => {
  const router = useRouter()

  return (
    <div className="w-full flex items-center  justify-start gap-4 mb-10">
      <Button
        color="light"
        className="cursor-pointer"
        onClick={() => router.push(URLPartsEnum.Categories)}
      >
        <HiArrowCircleLeft className="text-xl text-white" />
      </Button>
      <h2 className="text-white text-2xl">Add new category:</h2>
    </div>
  )
}

export default CategoryHeader
