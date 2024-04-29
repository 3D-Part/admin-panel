'use client' // This is a client component 👈🏽

import { SyntheticEvent, useEffect, useState } from 'react'
import { IoCloseCircleOutline } from 'react-icons/io5'

interface SearchProps {
  getData: (value: string) => void
  //   setValue: (value: string) => void;
}

const Search: React.FC<SearchProps> = ({
  getData,
  //   setValue,
}) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!query) return

    const delayDebounceFn = setTimeout(() => {
      getData(query)
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const reset = () => {
    setQuery('')
    getData('')
  }

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    getData(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-4">
      <label htmlFor="simple-search" className="sr-only">
        Search
      </label>
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          onChange={handleInputChange}
          type="text"
          id="simple-search"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search"
          value={query}
          // required
        />
      </div>
      {query && (
        <div onClick={reset} className="text-cyan-700 text-sm cursor-pointer">
          {/* <IoCloseCircleOutline /> */}
          reset
        </div>
      )}
    </form>
  )
}

export default Search
