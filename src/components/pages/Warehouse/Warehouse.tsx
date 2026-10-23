'use client'

import React, { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { HiClipboardList, HiCube, HiQrcode, HiTag } from 'react-icons/hi'
import Tabs from '@/components/common/Tabs/Tabs'
import { Asset, LabelItem, WarehouseProduct } from '@/shared/types/warehouse'
import Scanner from './components/Scanner/Scanner'
import Assets from './components/Assets/Assets'
import Labels, { assetLabel, productLabel } from './components/Labels/Labels'
import History from './components/History'

const TABS = ['skener', 'inventar', 'etikete', 'istorija'] as const
type TabId = (typeof TABS)[number]

const Warehouse = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requested = searchParams.get('tab') as TabId | null
  const activeTab: TabId =
    requested && TABS.includes(requested) ? requested : 'skener'

  // shared so Scanner and Inventory can send items to the label list
  const [labelItems, setLabelItems] = useState<LabelItem[]>([])

  const goTo = (tab: TabId) => router.replace(`${pathname}?tab=${tab}`)

  const addLabels = (items: LabelItem[]) => {
    setLabelItems((current) => {
      const next = [...current]
      items.forEach((item) => {
        if (!next.some((existing) => existing.key === item.key)) next.push(item)
      })
      return next
    })
    goTo('etikete')
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <Tabs.ModernTabs
        activeTab={activeTab}
        onTabChange={(tab) => goTo(tab as TabId)}
        tabs={[
          {
            id: 'skener',
            title: 'Skener',
            icon: HiQrcode,
            content: (
              <Scanner
                onPrintProduct={(product: WarehouseProduct) =>
                  addLabels([productLabel(product)])
                }
                onPrintAsset={(asset: Asset) => addLabels([assetLabel(asset)])}
              />
            ),
          },
          {
            id: 'inventar',
            title: 'Inventar',
            icon: HiCube,
            content: (
              <Assets
                onPrintLabels={(assets) => addLabels(assets.map(assetLabel))}
              />
            ),
          },
          {
            id: 'etikete',
            title: 'Etikete',
            icon: HiTag,
            content: <Labels items={labelItems} setItems={setLabelItems} />,
          },
          {
            id: 'istorija',
            title: 'Istorija',
            icon: HiClipboardList,
            content: <History />,
          },
        ]}
      />
    </div>
  )
}

export default Warehouse
