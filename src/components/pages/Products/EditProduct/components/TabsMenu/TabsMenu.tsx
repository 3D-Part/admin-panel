'use client'

import { HiAdjustments, HiUserCircle } from 'react-icons/hi'
import { MdDashboard } from 'react-icons/md'
import { useState } from 'react'
import Tabs from '@/components/common/Tabs/Tabs'
import GeneralInfo from '../GeneralInfo/GeneralInfo'
import Gallery from '../Gallery/Gallery'
import ProductAttributes from '../ProductAttributes/ProductAttributes'

export const TabsMenu = () => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1)

  const components = {
    1: <GeneralInfo />,
    2: <Gallery />,
    3: <ProductAttributes />,
  }

  const ActiveComponent = components[activeTab]

  return (
    <div className="flex flex-col w-full">
      <Tabs.Group>
        <Tabs.Item onClick={() => setActiveTab(1)} active={activeTab === 1}>
          <HiUserCircle className="text-2xl" />
          General Info
        </Tabs.Item>
        <Tabs.Item onClick={() => setActiveTab(2)} active={activeTab === 2}>
          <MdDashboard className="text-2xl" />
          Gallery
        </Tabs.Item>
        <Tabs.Item onClick={() => setActiveTab(3)} active={activeTab === 3}>
          <HiAdjustments className="text-2xl" />
          Attributes
        </Tabs.Item>
      </Tabs.Group>

      {ActiveComponent}
    </div>
  )
}
