'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useAttributesStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, AttributeData } from '@/shared/types'

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
    changeAttributeFilter,
  } = useAttributesStore()

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
    currentPageAttributes.length > 0 ? 'bg-black/30' : 'bg-transparent'

  useEffect(() => {
    changeAttributeFilter({})
  }, [])

  useEffect(() => {
    fetchAttributesData()
  }, [currentPage, fetchAttributesData])

  return (
    <div className="mt-8">
      <div className="overflow-x-auto relative bg-transparent min-h-[100px]">
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Edit or Remove</span>
            </Table.HeadCell>
          </Table.Head>
          {/* {!loader && ( */}
          <Table.Body className="divide-y">
            {currentPageAttributes.length > 0 &&
              currentPageAttributes.map((attribute) => {
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
          {/* )} */}
        </Table>
        {loader && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${loaderBg}`}
          >
            <Loader />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4 items-center w-full">
        <Pagination
          className="mt-8"
          currentPage={currentPage}
          onPageChange={(page) => {
            changeCurrentPage(page)
          }}
          totalPages={totalPages}
        />

        <p className="text-white/50 text-sm">
          Total: {totalPages * itemsPerPage}
        </p>
      </div>
    </div>
  )
}
