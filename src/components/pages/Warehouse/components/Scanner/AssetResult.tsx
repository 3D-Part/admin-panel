'use client'

import { Badge, Button } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import WarehouseAPI from '@/services/warehouse'
import {
  assetStatusColor,
  assetStatusLabels,
} from '@/shared/helpers/warehouseLabels'
import { Asset, StockMovement } from '@/shared/types/warehouse'
import MovementList from '../MovementList'
import AssetStatusForm from '../AssetStatusForm'

type AssetResultProps = {
  asset: Asset
  onDone: () => void
  onPrintLabel: (asset: Asset) => void
}

const AssetResult: React.FC<AssetResultProps> = ({
  asset: initialAsset,
  onDone,
  onPrintLabel,
}) => {
  const [asset, setAsset] = useState(initialAsset)
  const [movements, setMovements] = useState<StockMovement[]>([])

  const loadMovements = useCallback(async () => {
    const data = await WarehouseAPI.getMovements({
      assetId: initialAsset.id,
      limit: 10,
    })
    setMovements(data?.rows ?? [])
  }, [initialAsset.id])

  useEffect(() => {
    setAsset(initialAsset)
    loadMovements()
  }, [initialAsset, loadMovements])

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {asset.name}
          </h3>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-mono font-semibold">{asset.code}</span>
            {asset.category && <span>{asset.category}</span>}
            {asset.serialNumber && <span>S/N {asset.serialNumber}</span>}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span>Lokacija: {asset.location || '—'}</span>
            <span>Zaduženo: {asset.assignedTo || '—'}</span>
          </div>
        </div>
        <Badge color={assetStatusColor[asset.status]} size="sm" className="ml-auto">
          {assetStatusLabels[asset.status]}
        </Badge>
        <Button size="sm" color="light" onClick={() => onPrintLabel(asset)}>
          Etiketa
        </Button>
      </div>

      <AssetStatusForm
        asset={asset}
        onChanged={(updated) => {
          setAsset(updated)
          loadMovements()
          onDone()
        }}
      />

      <div>
        <h4 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
          Istorija
        </h4>
        <MovementList movements={movements} />
      </div>
    </div>
  )
}

export default AssetResult
