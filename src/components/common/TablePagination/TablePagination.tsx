'use client'

import { Pagination as FlowbitePagination, PaginationProps } from 'flowbite-react'
import React, { useRef } from 'react'
import { tx } from '@/shared/i18n'

/**
 * After a page change the table shows its first row again: the table body
 * scrolls back to its top, and the page scrolls up to the table when the
 * table's top is out of view. `from` is any element inside the table's box.
 */
export const scrollTableToTop = (from: HTMLElement | null) => {
  if (!from) return
  // the closest box around the pager that holds the table body
  let box: HTMLElement | null = from.parentElement
  while (box && !box.querySelector('.table-body-container, table, .mobile-card-container, .table-on-phone')) box = box.parentElement
  if (!box) return
  const toTop = () => {
    box!.querySelectorAll<HTMLElement>('.table-body-container, .mobile-card-container, .table-on-phone').forEach((body) => {
      body.scrollTop = 0
    })
    if (box!.getBoundingClientRect().top < 0) box!.scrollIntoView({ block: 'start' })
  }
  // now, and again once the new rows have loaded and been drawn (loading the
  // page changes the height, and the browser then keeps the pager in view)
  requestAnimationFrame(toTop)
  setTimeout(toTop, 350)
  setTimeout(toTop, 900)
}

/** The flowbite pager, which also brings the table back to its first row. */
export const Pagination: React.FC<PaginationProps> = ({ onPageChange, ...props }) => {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className="contents">
      <FlowbitePagination
        previousLabel={tx('Previous')}
        nextLabel={tx('Next')}
        {...props}
        onPageChange={(page) => {
          onPageChange(page)
          scrollTableToTop(ref.current)
        }}
      />
    </div>
  )
}

export default Pagination
