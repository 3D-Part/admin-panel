'use client' // This is a client component 👈🏽

import React from 'react'
import UsersSearch from './UsersSearch'
import UsersSort from './UsersSort'

export const UsersHeader = () => {
  return (
    <div className="w-full flex justify-between items-center gap-2 md:gap-4 z-20">
      <div className="flex-1 min-w-0">
        <UsersSearch />
      </div>
      <UsersSort />
    </div>
  )
}
