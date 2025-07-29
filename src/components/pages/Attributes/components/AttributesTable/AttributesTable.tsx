'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useAttributesStore, useCurrentUserStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, AttributeData } from '@/shared/types'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

type AttributesTableType = {
  onWarningModalOpen: (attribute: AttributeData) => void
  openEditModal: (attribute: AttributeData) => void
}

export const AttributesTable: React.FC<AttributesTableType> = ({
  onWarningModalOpen,
  openEditModal,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchAttributes,
    currentPageAttributes,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useAttributesStore()

  const { currentUser } = useCurrentUserStore()

  const hasWritePermission = hasPermission(
    currentUser?.permissions,
    PermissionEnum.ATTRIBUTES_WRITE,
    currentUser?.role
  )

  const fetchAttributesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchAttributes(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchAttributes, itemsPerPage])

  const loaderBg =
    currentPageAttributes.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchAttributesData()
  }, [currentPage, fetchAttributesData])

  // Generate mobile cards
  const mobileCards = currentPageAttributes.map((attribute) => {
    const { name } = attribute

    return (
      <MobileCardBuilder
        key={attribute.id}
        title={name}
        onClick={
          hasWritePermission ? () => openEditModal(attribute) : undefined
        }
        items={[]}
        actions={
          hasWritePermission ? (
            <div className="flex justify-end items-center gap-4">
              <span
                onClick={() => openEditModal(attribute)}
                className="font-medium table-action-link cursor-pointer hover:underline"
              >
                Edit
              </span>
              <span
                onClick={() => onWarningModalOpen(attribute)}
                className="font-medium table-action-danger cursor-pointer hover:underline"
              >
                Remove
              </span>
            </div>
          ) : null
        }
      />
    )
  })

  return (
    <ResponsiveTableWrapper
      mobileCards={mobileCards}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => changeCurrentPage(page)}
      count={count}
    >
      <div className="table-container">
        <Table className="w-full table-fixed">
          <Table.Head className="table-header">
            <Table.HeadCell className="table-cell">Name</Table.HeadCell>
            <Table.HeadCell className="table-cell">
              <span className="sr-only">Actions</span>
            </Table.HeadCell>
          </Table.Head>
        </Table>

        <div className="table-body-container relative">
          <Table className="w-full table-fixed">
            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageAttributes.map((attribute) => {
                return (
                  <TableItem
                    key={attribute.id}
                    attribute={attribute}
                    onWarningModalOpen={onWarningModalOpen}
                    openEditModal={openEditModal}
                  />
                )
              })}
            </Table.Body>
          </Table>
          {loader && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${loaderBg} rounded-xl`}
            >
              <Loader />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <Pagination
          currentPage={currentPage}
          onPageChange={(page) => {
            changeCurrentPage(page)
          }}
          totalPages={totalPages}
        />

        <p className="table-total-text text-sm">Total: {count}</p>
      </div>
    </ResponsiveTableWrapper>
  )
}
