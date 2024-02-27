'use client'

import { Tabs } from 'flowbite-react'
import { HiAdjustments, HiUserCircle } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import GeneralInfo from '../GeneralInfo/GeneralInfo'
import ProductAttributes from '../ProductAttributes/ProductAttributes'

export const TabsMenu = () => {
  return (
    <div className="flex w-full ">
      <Tabs.Group
        className="gap-5 text-white justify-start flex-1"
        aria-label="Default tabs"
        style="default"
      >
        <Tabs.Item active icon={HiUserCircle} title="General Info">
          <GeneralInfo />
        </Tabs.Item>
        <Tabs.Item disabled icon={HiAdjustments} title="Gallery">
          Gallery
        </Tabs.Item>
        <Tabs.Item disabled icon={MdDashboard} title="Attributes">
          <ProductAttributes />
        </Tabs.Item>
      </Tabs.Group>
    </div>
  )
}
