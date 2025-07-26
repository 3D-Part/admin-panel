'use client'

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useUISliceStore } from '@/store/store'

export const EmployeesHeader = () => {
  const { changeIsEmployeeAddNewModalOpen } = useUISliceStore()

  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
      <Button
        className="cursor-pointer"
        onClick={() => changeIsEmployeeAddNewModalOpen(true)}
      >
        Create New <HiPlus className="ml-2" />
      </Button>
    </div>
  )
}
