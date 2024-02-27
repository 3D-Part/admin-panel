'use client'
import React, { ReactNode } from 'react'

const Group = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex text-center flex-wrap border-b border-gray-200 dark:border-gray-700 gap-5 text-white justify-start mb-4">
      {children}
    </div>
  )
}

type ItemType = {
  active: boolean
  children: ReactNode
  onClick: () => void
}

const Item: React.FC<ItemType> = ({ active, children, onClick }) => {
  const defaultStyle =
    'cursor-pointer flex gap-4 items-center justify-center p-4 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500 focus:ring-4 focus:ring-cyan-300 focus:outline-none rounded-t-lg'
  const activeStyle =
    'bg-gray-100 text-cyan-600 dark:bg-gray-800 dark:text-cyan-500'
  const notActiveStyle =
    'text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'

  return (
    <div
      onClick={onClick}
      className={`${defaultStyle} ${active ? activeStyle : notActiveStyle}`}
    >
      {children}
    </div>
  )
}

const Tabs = {
  Group,
  Item,
}
export default Tabs
