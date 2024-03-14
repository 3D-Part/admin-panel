'use client'

import { Button } from 'flowbite-react'
import React, { useState } from 'react'
import SelectUsersModal from './SelectUsersModal'

const AssignUsers = () => {
  const [isMOdalOpen, setIsModalOpen] = useState(false)

  const openSelectModal = () => {
    setIsModalOpen(true)
  }

  const onClose = () => {
    setIsModalOpen(false)
  }

  return (
    <div>
      <Button onClick={openSelectModal} color="purple" className="mt-6">
        Assign Users
      </Button>
      <SelectUsersModal isOpen={isMOdalOpen} onClose={onClose} />
    </div>
  )
}

export default AssignUsers
