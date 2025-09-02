'use client'

import { User } from '@/shared/types'
import { Button, Table } from 'flowbite-react'
import React, { useState } from 'react'
import {
  useEmployeesSliceStore,
  useUISliceStore,
  useCurrentUserStore,
} from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'
import { WarningModal } from '@/components/common'
import { HiTrash } from 'react-icons/hi'

type TableItemType = {
  employee: User
}

export const TableItem: React.FC<TableItemType> = ({ employee }) => {
  const { fullName, email } = employee
  const { changeSelectedEmployee, deleteEmployee } = useEmployeesSliceStore()
  const { changeIsEmployeeEditModalOpen } = useUISliceStore()
  const { currentUser } = useCurrentUserStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.EMPLOYEE_WRITE,
    currentUser?.role
  )

  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent row click when clicking on action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return
    }

    if (!hasWritePermission) {
      return
    }
    changeSelectedEmployee(employee)
    changeIsEmployeeEditModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    const success = await deleteEmployee(employee.id)
    setIsDeleting(false)

    if (success) {
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  return (
    <>
      <Table.Row
        className={`table-row transition-colors ${
          hasWritePermission
            ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
            : ''
        }`}
        onClick={handleRowClick}
      >
        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">
            {fullName}
          </div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-6">{email}</div>
        </Table.Cell>
        <Table.Cell className="whitespace-nowrap font-medium table-cell">
          {hasWritePermission && (
            <div className="flex justify-end items-center gap-2">
              {/* <Button
                size="sm"
                color="failure"
                onClick={handleDeleteClick}
                className="action-button"
                disabled={isDeleting}
              > */}
              <span
                onClick={handleDeleteClick}
                className="font-medium table-action-danger cursor-pointer hover:underline"
              >
                Remove
              </span>
              {/* </Button> */}
            </div>
          )}
        </Table.Cell>
      </Table.Row>

      <WarningModal
        isOpen={showDeleteModal}
        onSave={handleDeleteConfirm}
        onClose={handleDeleteCancel}
        isLoading={isDeleting}
        message={`Are you sure you want to delete employee "${fullName}"?`}
        buttonColor="failure"
      />
    </>
  )
}
