'use client'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useState } from 'react'
import { Checkbox, Pagination, Table } from 'flowbite-react'
import { TableItem, ZohoStatusBadge } from './TableItem/TableItem'
import { useSubscribersSliceStore } from '@/store/store'
import {
  Loader,
  ResponsiveTableWrapper,
  MobileCardBuilder,
} from '@/components/common'
import { PaginationData, Subscriber } from '@/shared/types'

type Props = { selected: string[]; setSelected: React.Dispatch<React.SetStateAction<string[]>> }

export const SubscribersTable = ({ selected, setSelected }: Props) => {
  const [loader, setLoader] = useState(true)

  const {
    fetchSubscribers,
    currentPageSubscribers,
    currentPage,
    changeCurrentPage,
    itemsPerPage,
    totalPages,
    count,
  } = useSubscribersSliceStore()

  const fetchSubscribersData = useCallback(async () => {
    setLoader(true)
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    const data = await fetchSubscribers(paginationData)
    if (data) {
      setLoader(false)
    } else {
      setLoader(true)
    }
  }, [currentPage, fetchSubscribers, itemsPerPage])

  const toggle = (email: string) =>
    setSelected((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]))
  const pageEmails = currentPageSubscribers.map((s) => s.email)
  const allOnPage = pageEmails.length > 0 && pageEmails.every((e) => selected.includes(e))
  const togglePage = () =>
    setSelected((prev) =>
      allOnPage ? prev.filter((e) => !pageEmails.includes(e)) : Array.from(new Set([...prev, ...pageEmails]))
    )

  // useEffect(() => {
  //   changeManufactureFilter({});
  // }, []);

  const loaderBg =
    currentPageSubscribers.length > 0
      ? 'bg-white/50 dark:bg-black/30'
      : 'bg-transparent'

  useEffect(() => {
    fetchSubscribersData()
  }, [currentPage, fetchSubscribersData])

  // Generate mobile cards
  const mobileCards = currentPageSubscribers.map((subscriber: Subscriber) => {
    const { email } = subscriber

    return (
      <MobileCardBuilder
        key={subscriber.id}
        title={email}
        subtitle="Subscriber"
        items={[
          {
            label: tx("Email"),
            value: email,
          },
          {
            label: 'Zoho',
            value: <ZohoStatusBadge subscriber={subscriber} />,
          },
        ]}
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
      <div className="table-container relative">
        <div className="table-body-container ">
          <Table className="w-full">
            <Table.Head className="table-header">
              <Table.HeadCell className="w-10">
                <Checkbox checked={allOnPage} onChange={togglePage} aria-label={tx("Select page")} />
              </Table.HeadCell>
              <Table.HeadCell className="table-cell">{tx("Email")}</Table.HeadCell>
              <Table.HeadCell className="table-cell">Zoho</Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPageSubscribers.map((subscriber) => {
                return <TableItem key={subscriber.id} subscriber={subscriber} checked={selected.includes(subscriber.email)} onToggle={() => toggle(subscriber.email)} />
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

      <div className="hidden md:flex justify-between gap-4 items-center w-full mt-8 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
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
