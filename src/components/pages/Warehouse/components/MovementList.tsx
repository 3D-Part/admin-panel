'use client'

import { Badge } from 'flowbite-react'
import React from 'react'
import {
  assetStatusLabels,
  formatDateTime,
  movementColor,
  movementLabels,
} from '@/shared/helpers/warehouseLabels'
import { StockMovement } from '@/shared/types/warehouse'

type MovementListProps = {
  movements: StockMovement[]
  // show which product / asset the entry belongs to (the global history)
  showItem?: boolean
}

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`)

const MovementList: React.FC<MovementListProps> = ({
  movements,
  showItem = false,
}) => {
  if (movements.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Još nema zapisa.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {movements.map((movement) => {
        const item = movement.product || movement.asset
        return (
          <li key={movement.id} className="py-2 flex flex-col gap-1 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color={movementColor[movement.type]}>
                {movementLabels[movement.type]}
              </Badge>

              {movement.quantityChange != null && (
                <span
                  className={`font-semibold ${
                    movement.quantityChange < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  }`}
                >
                  {signed(movement.quantityChange)} kom
                </span>
              )}
              {movement.quantityAfter != null && (
                <span className="text-gray-600 dark:text-gray-300">
                  → stanje {movement.quantityAfter}
                </span>
              )}

              {movement.statusAfter &&
                movement.statusBefore !== movement.statusAfter && (
                  <span className="text-gray-700 dark:text-gray-200">
                    {movement.statusBefore
                      ? `${assetStatusLabels[movement.statusBefore]} → `
                      : ''}
                    {assetStatusLabels[movement.statusAfter]}
                  </span>
                )}

              {showItem && item && (
                <span className="text-gray-900 dark:text-white">
                  <span className="font-mono text-gray-600 dark:text-gray-300">{item.code}</span> {item.name}
                </span>
              )}

              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(movement.createdAt)}
                {movement.user &&
                  ` · ${movement.user.fullName || movement.user.email}`}
              </span>
            </div>
            {movement.note && (
              <p className="whitespace-pre-line text-gray-600 dark:text-gray-400">
                {movement.note}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default MovementList
