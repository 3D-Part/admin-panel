'use client' // This is a client component 👈🏽

import { Pagination, Table } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import { TableItem } from './TableItem/TableItem'
import { useManufactureStore } from '@/store/store'
import { Loader } from '@/components/common'
import { PaginationData, ManufacturerData } from '@/shared/types'

type ManufacturesTableType = {
  onWarningModalOpen: (manufacture: ManufacturerData) => void
  openEditModal: (manufacture: ManufacturerData) => void
}

export const ManufacturesTable: React.FC<ManufacturesTableType> = ({
  onWarningModalOpen,
  openEditModal,
}) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchManufactures,
    currentPageManufactures,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    changeManufactureFilter,
  } = useManufactureStore()

  const fetchManufacturesData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchManufactures(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchManufactures, itemsPerPage])

  const loaderBg =
    currentPageManufactures.length > 0 ? 'bg-black/30' : 'bg-transparent'

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  useEffect(() => {
    fetchManufacturesData()
  }, [currentPage, fetchManufacturesData])

  return (
    <div className="mt-8">
      <div className="overflow-x-auto relative min-h-[100px]">
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>
              <span className="sr-only">Edit or Remove</span>
            </Table.HeadCell>
          </Table.Head>
          {/* {!loader && ( */}
          <Table.Body className="divide-y">
            {currentPageManufactures.length > 0 &&
              currentPageManufactures.map((manufacture) => {
                return (
                  <TableItem
                    key={manufacture.id}
                    manufacture={manufacture}
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
