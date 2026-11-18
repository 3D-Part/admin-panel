'use client'
import { tx } from '@/shared/i18n'

import React from 'react'
import { PermissionEnum } from '@/shared/types'
import { EMPLOYEE_PERMISSION_SECTIONS } from '@/shared/helpers/permissions'

type Level = 'none' | 'view' | 'edit'

/**
 * One row per admin section: no access, view only, or view and edit.
 * A section without a view permission (Settings) has only "no access" and "edit".
 */
const PermissionPicker: React.FC<{
  value: PermissionEnum[]
  onChange: (next: PermissionEnum[]) => void
  disabled?: boolean
}> = ({ value, onChange, disabled }) => {
  const levelOf = (section: (typeof EMPLOYEE_PERMISSION_SECTIONS)[number]): Level =>
    section.edit && value.includes(section.edit)
      ? 'edit'
      : section.view && value.includes(section.view)
        ? 'view'
        : 'none'

  const setLevel = (section: (typeof EMPLOYEE_PERMISSION_SECTIONS)[number], level: Level) => {
    const own = [section.view, section.edit].filter(Boolean) as PermissionEnum[]
    const rest = value.filter((permission) => !own.includes(permission))
    const add =
      level === 'edit' ? own : level === 'view' && section.view ? [section.view] : []
    onChange([...rest, ...add])
  }

  const setAll = (level: Level) => {
    let next: PermissionEnum[] = []
    for (const section of EMPLOYEE_PERMISSION_SECTIONS) {
      if (level === 'edit') next.push(...([section.view, section.edit].filter(Boolean) as PermissionEnum[]))
      if (level === 'view' && section.view) next.push(section.view)
    }
    onChange(next)
  }

  const options: { level: Level; label: string }[] = [
    { level: 'none', label: tx('No access') },
    { level: 'view', label: tx('View') },
    { level: 'edit', label: tx('View and edit') },
  ]

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400">{tx('Set all to')}:</span>
        {options.map((option) => (
          <button
            key={option.level}
            type="button"
            disabled={disabled}
            onClick={() => setAll(option.level)}
            className="font-medium text-purple-700 hover:underline disabled:opacity-50 dark:text-purple-300"
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-600">
        {EMPLOYEE_PERMISSION_SECTIONS.map((section) => {
          const current = levelOf(section)
          return (
            <div
              key={section.title}
              className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{tx(section.title)}</p>
                {section.hint && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tx(section.hint)}</p>
                )}
              </div>
              <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-600">
                {options
                  .filter((option) => option.level !== 'view' || section.view)
                  .filter((option) => option.level !== 'edit' || section.edit)
                  .map((option) => {
                    const active = current === option.level
                    const label =
                      option.level === 'edit' && !section.view ? tx('Full access') : option.label
                    return (
                      <button
                        key={option.level}
                        type="button"
                        disabled={disabled}
                        onClick={() => setLevel(section, option.level)}
                        className={`px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                          active
                            ? option.level === 'none'
                              ? 'bg-gray-600 text-white dark:bg-gray-500'
                              : 'bg-purple-600 text-white'
                            : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PermissionPicker
