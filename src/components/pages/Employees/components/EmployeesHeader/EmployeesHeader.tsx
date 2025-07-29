'use client'

import React from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useUISliceStore, useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const EmployeesHeader = () => {
  const { changeIsEmployeeAddNewModalOpen } = useUISliceStore()
  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.EMPLOYEE_WRITE,
    currentUser?.role
  )

  return (
    <div className="w-full flex justify-between items-center flex-wrap gap-4">
      {hasWritePermission && (
        <Button
          className="cursor-pointer"
          onClick={() => changeIsEmployeeAddNewModalOpen(true)}
        >
          Create New <HiPlus className="ml-2" />
        </Button>
      )}
    </div>
  )
}
