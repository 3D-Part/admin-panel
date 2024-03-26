'use client' // This is a client component 👈🏽

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { BiMessageDetail } from 'react-icons/bi'
import SubscribersContactForm from '../SubscribersContactForm/SubscribersContactForm'

export const SubscribersHeader = () => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  const toggleFormModalVisible = () => {
    setIsFormModalOpen(!isFormModalOpen)
  }

  const router = useRouter()

  return (
    <>
      <div className="w-full flex justify-between items-center flex-wrap gap-4">
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
