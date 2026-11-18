'use client'
import { tx } from '@/shared/i18n'

import React, { useId, useState } from 'react'
import { HiInformationCircle } from 'react-icons/hi'

/**
 * A small (i) for the top right corner of a box. Its short explanation shows
 * on hover, on keyboard focus and on a tap (phones have no hover). Put it in a
 * `relative` box.
 */
const InfoTip: React.FC<{ text: string; className?: string }> = ({
  text,
  className = 'absolute top-2 right-2',
}) => {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span className={`${className} group z-10`}>
      <button
        type="button"
        aria-label={tx('What is this?')}
        aria-describedby={id}
        onClick={() => setOpen(!open)}
        onBlur={() => setOpen(false)}
        className="rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-500 dark:hover:text-gray-300"
      >
        <HiInformationCircle className="h-5 w-5" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={`${
          open ? 'block' : 'hidden'
        } group-hover:block group-focus-within:block absolute right-0 top-6 w-64 rounded-lg bg-gray-900 px-3 py-2 text-xs font-normal leading-snug text-white shadow-lg dark:bg-gray-700`}
      >
        {text}
      </span>
    </span>
  )
}

export default InfoTip
