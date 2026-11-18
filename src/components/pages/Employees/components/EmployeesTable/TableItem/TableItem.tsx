'use client'
import { tx } from '@/shared/i18n'

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

  // owner accounts have full access and are not edited from this list
  const isOwner = employee.role === 'admin'
  const hasWritePermission =
    !isOwner &&
    hasPermission(
      currentUser?.permissions,
      PermissionEnum.EMPLOYEE_WRITE,
      currentUser?.role
    )
  const sections = isOwner ? 0 : employee.permissions?.length ?? 0

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
          <div className="flex justify-start items-center gap-3">
            {fullName}
            {isOwner ? (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">
                {tx("Full access")}
              </span>
            ) : sections === 0 ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {tx("No access")}
              </span>
            ) : null}
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
                {tx("Remove")}
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
        message={tx("Are you sure you want to delete employee \"{fullName}\"?", { fullName })}
        buttonColor="failure"
      />
    </>
  )
}
