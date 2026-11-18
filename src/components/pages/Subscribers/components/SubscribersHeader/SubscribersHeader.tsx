'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button } from 'flowbite-react'
import { BiMessageDetail } from 'react-icons/bi'
import SubscribersContactForm from '../SubscribersContactForm/SubscribersContactForm'
import SubscribersSearch from './SubscribersSearch'
import { ZohoCampaignModal } from '../ZohoCampaign/ZohoCampaignModal'

export const SubscribersHeader = ({ selected, total }: { selected: string[]; total: number }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDraftsOpen, setIsDraftsOpen] = useState(false)

  const toggleFormModalVisible = () => {
    setIsFormModalOpen(!isFormModalOpen)
  }

  return (
    <>
      <div className="w-full flex justify-between items-center flex-wrap gap-4">
        <div className="w-full md:w-auto md:flex-1 min-w-0">
          <SubscribersSearch />
        </div>
        <Button className="cursor-pointer" onClick={() => setIsDraftsOpen(true)} color="purple">
          {tx("New campaign")}
          <BiMessageDetail className="ml-2" />
        </Button>
        <Button
          className="cursor-pointer"
          outline
          onClick={toggleFormModalVisible}
          color="purple"
        >
          {tx("Send email")}
          <BiMessageDetail className="ml-2" />
        </Button>
      </div>

      {/* newsletters go out through Zoho Campaigns */}
      <ZohoCampaignModal isOpen={isDraftsOpen} onClose={() => setIsDraftsOpen(false)} selected={selected} />

      <SubscribersContactForm
        isOpen={isFormModalOpen}
        onClose={toggleFormModalVisible}
        setIsModalOpen={toggleFormModalVisible}
        selected={selected}
      />
    </>
  )
}
