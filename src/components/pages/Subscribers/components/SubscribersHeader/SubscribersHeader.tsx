'use client'

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import { BiMessageDetail } from 'react-icons/bi'
import SubscribersContactForm from '../SubscribersContactForm/SubscribersContactForm'
// import SubscribersSearch from './SubscribersSearch'

export const SubscribersHeader = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const toggleFormModalVisible = () => {
    setIsFormModalOpen(!isFormModalOpen)
  }

  return (
    <>
      <div className="w-full flex justify-between items-center flex-wrap gap-4">
        <div className="flex-1 min-w-0">{/* <SubscribersSearch /> */}</div>
        <Button className="cursor-pointer" onClick={toggleFormModalVisible}>
          Send email
          <BiMessageDetail className="ml-2" />
        </Button>
      </div>

      <SubscribersContactForm
        isOpen={isFormModalOpen}
        onClose={toggleFormModalVisible}
        setIsModalOpen={toggleFormModalVisible}
      />
    </>
  )
}
