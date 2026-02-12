import { Spinner } from 'flowbite-react'
import React from 'react'

const Loader = () => {
  return (
    <div className="w-full mt-10 flex justify-center items-center">
      <Spinner aria-label="Loading Categories" size="lg" />
    </div>
  )
}

export default Loader
