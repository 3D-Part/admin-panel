'use client'
import { tx } from '@/shared/i18n'

import React, { useRef, useState } from 'react'
import { Button, Label, Textarea, TextInput } from 'flowbite-react'
import { HiPencil, HiPlus, HiTrash, HiUpload } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BadgeItem, badgeProblem, blankBadge, newTierId, svgDataUri } from '@/shared/helpers/tiers'

type Props = {
  value: BadgeItem[]
  onChange: (next: BadgeItem[]) => void
}

/** A badge picture, the same size everywhere. */
export const BadgeImage: React.FC<{ svg: string; size?: number; alt?: string }> = ({ svg, size = 48, alt = '' }) => (
  // shown as a picture, so nothing inside the SVG can run
  // eslint-disable-next-line @next/next/no-img-element
  <img src={svgDataUri(svg)} width={size} height={size} alt={alt} className="shrink-0" style={{ width: size, height: size }} />
)

/**
 * The badges of the shop: the ones that come with it, the admin's own uploads,
 * and the SVG of each one to change. Tiers pick a badge from here.
 */
const BadgeLibrary: React.FC<Props> = ({ value, onChange }) => {
  const [editing, setEditing] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const update = (id: string, patch: Partial<BadgeItem>) =>
    onChange(value.map((badge) => (badge.id === id ? { ...badge, ...patch } : badge)))

  const add = (name: string, svg?: string) => {
    const id = newTierId(name, value.map((badge) => badge.id)).toLowerCase()
    const blank = blankBadge(id, name)
    onChange([...value, { ...blank, svg: svg ?? blank.svg }])
    if (!svg) setEditing(id)
  }

  const upload = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    const problem = badgeProblem(text)
    if (problem) {
      toast(tx(problem), { type: 'error', autoClose: 5000 })
      return
    }
    add(file.name.replace(/\.svg$/i, '').slice(0, 40) || 'Badge', text.trim())
    toast(tx("Badge added. Save the settings to keep it."), { type: 'success', autoClose: 2500 })
  }

  return (
    <div>
      <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">{tx("Badges")}</h4>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        {tx("The pictures customers see next to their tier. Every badge is an SVG of exactly 64 by 64 (viewBox 0 0 64 64), so they all line up. Change the code of a badge, or upload your own.")}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {value.map((badge) => {
          const problem = badgeProblem(badge.svg)
          return (
            <div key={badge.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <BadgeImage svg={problem ? blankBadge('x', 'x').svg : badge.svg} size={56} alt={badge.name} />
                <TextInput
                  className="min-w-0 flex-1"
                  aria-label={tx("Badge name")}
                  maxLength={40}
                  value={badge.name}
                  onChange={(e) => update(badge.id, { name: e.target.value })}
                />
                <Button
                  size="xs"
                  color="gray"
                  title={tx("Edit the SVG")}
                  aria-label={tx("Edit the SVG")}
                  onClick={() => setEditing(editing === badge.id ? null : badge.id)}
                >
                  <HiPencil className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  color="gray"
                  title={tx("Remove badge")}
                  aria-label={tx("Remove badge")}
                  onClick={() => onChange(value.filter((item) => item.id !== badge.id))}
                >
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
              {problem && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{tx(problem)}</p>}
              {editing === badge.id && (
                <div className="mt-3">
                  <Label htmlFor={`badge-svg-${badge.id}`} value={tx("SVG code")} />
                  <Textarea
                    id={`badge-svg-${badge.id}`}
                    rows={9}
                    className="font-mono text-xs"
                    spellCheck={false}
                    value={badge.svg}
                    onChange={(e) => update(badge.id, { svg: e.target.value })}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            upload(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <Button color="gray" size="sm" onClick={() => fileRef.current?.click()}>
          <HiUpload className="mr-1 h-4 w-4" />
          {tx("Upload SVG")}
        </Button>
        <Button color="gray" size="sm" onClick={() => add(tx("New badge"))}>
          <HiPlus className="mr-1 h-4 w-4" />
          {tx("New badge")}
        </Button>
      </div>
    </div>
  )
}

export default BadgeLibrary
