'use client'

import { Button, Select } from 'flowbite-react'
import React, { useCallback, useEffect, useState } from 'react'
import WarehouseAPI from '@/services/warehouse'
import { movementLabels } from '@/shared/helpers/warehouseLabels'
import { MovementType, StockMovement } from '@/shared/types/warehouse'
import MovementList from './MovementList'

const PAGE_SIZE = 50

/** Everything that happened in the warehouse, newest first */
const History: React.FC = () => {
  const [type, setType] = useState('')
  const [rows, setRows] = useState<StockMovement[]>([])
  const [count, setCount] = useState(0)

  const load = useCallback(
    async (offset = 0) => {
      const data = await WarehouseAPI.getMovements({
        type: type || undefined,
        limit: PAGE_SIZE,
        offset,
      })
      if (!data) return
      setCount(data.count)
      setRows((previous) =>
        offset === 0 ? data.rows : [...previous, ...data.rows]
      )
    },
    [type]
  )

  useEffect(() => {
    load(0)
  }, [load])

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <Select
        className="w-64"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">Sve promjene</option>
        {(Object.keys(movementLabels) as MovementType[]).map((value) => (
          <option key={value} value={value}>
            {movementLabels[value]}
          </option>
        ))}
      </Select>

      <MovementList movements={rows} showItem />

      {rows.length < count && (
        <Button color="gray" className="self-center" onClick={() => load(rows.length)}>
          Učitaj još ({count - rows.length})
        </Button>
      )}
    </div>
  )
}

export default History
