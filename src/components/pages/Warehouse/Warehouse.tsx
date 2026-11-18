'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { HiClipboardList, HiCube, HiQrcode, HiTag } from 'react-icons/hi'
import { Button } from 'flowbite-react'
import Tabs from '@/components/common/Tabs/Tabs'
import { Asset, LabelItem, WarehouseProduct } from '@/shared/types/warehouse'
import Scanner from './components/Scanner/Scanner'
import Assets from './components/Assets/Assets'
import Labels, { assetLabel, productLabel } from './components/Labels/Labels'
import History from './components/History'
import ProductInventory from './components/Inventory/ProductInventory'

const TABS = ['scanner', 'inventory', 'labels', 'history'] as const
type TabId = (typeof TABS)[number]

const TabHelp: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{children}</p>
)

const Warehouse = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requested = searchParams.get('tab') as TabId | null
  const activeTab: TabId =
    requested && TABS.includes(requested) ? requested : 'scanner'

  // shared so Scanner and Inventory can send items to the label list
  const [labelItems, setLabelItems] = useState<LabelItem[]>([])
  const [inventoryView, setInventoryView] = useState<'products' | 'assets'>(
    'products'
  )

  const goTo = (tab: TabId) => router.replace(`${pathname}?tab=${tab}`)

  const addLabels = (items: LabelItem[]) => {
    setLabelItems((current) => {
      const next = [...current]
      items.forEach((item) => {
        if (!next.some((existing) => existing.key === item.key)) next.push(item)
      })
      return next
    })
    goTo('labels')
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <Tabs.ModernTabs
        activeTab={activeTab}
        onTabChange={(tab) => goTo(tab as TabId)}
        tabs={[
          {
            id: 'scanner',
            title: tx("Scanner"),
            icon: HiQrcode,
            content: (
              <>
              <TabHelp>
                Goods arrived or left? Scan the barcode (or type it), then add or
                remove pieces. The site stock changes right away.
              </TabHelp>
              <Scanner
                onPrintProduct={(product: WarehouseProduct) =>
                  addLabels([productLabel(product)])
                }
                onPrintAsset={(asset: Asset) => addLabels([assetLabel(asset)])}
              />
              </>
            ),
          },
          {
            id: 'inventory',
            title: tx("Inventory"),
            icon: HiCube,
            content: (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Button.Group>
                    <Button
                      size="sm"
                      color={inventoryView === 'products' ? 'purple' : 'gray'}
                      onClick={() => setInventoryView('products')}
                    >
                      {tx('Products')}
                    </Button>
                    <Button
                      size="sm"
                      color={inventoryView === 'assets' ? 'purple' : 'gray'}
                      onClick={() => setInventoryView('assets')}
                    >
                      {tx('Company items')}
                    </Button>
                  </Button.Group>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {inventoryView === 'products'
                      ? tx('Every product with the barcode of its code. Tick products and click Labels to print stickers.')
                      : tx('Things the shop owns and does not sell, such as printers and tools.')}
                  </span>
                </div>
                {inventoryView === 'products' ? (
                  <ProductInventory
                    onPrintLabels={(products) => addLabels(products.map(productLabel))}
                  />
                ) : (
                  <Assets
                    onPrintLabels={(assets) => addLabels(assets.map(assetLabel))}
                  />
                )}
              </>
            ),
          },
          {
            id: 'labels',
            title: tx("Labels"),
            icon: HiTag,
            content: (
              <>
                <TabHelp>
                  {tx("Print barcode stickers. Add items from Scanner or Inventory, choose the sticker size and print.")}
                </TabHelp>
                <Labels items={labelItems} setItems={setLabelItems} />
              </>
            ),
          },
          {
            id: 'history',
            title: tx("History"),
            icon: HiClipboardList,
            content: (
              <>
                <TabHelp>
                  {tx("Every stock change, who made it and why. Nothing to do here, look here when a number does not add up.")}
                </TabHelp>
                <History />
              </>
            ),
          },
        ]}
      />
    </div>
  )
}

export default Warehouse
