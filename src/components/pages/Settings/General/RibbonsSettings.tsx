'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Spinner, TextInput } from 'flowbite-react'
import { HiArrowDown, HiArrowUp, HiBan, HiPlus, HiTrash, HiUpload } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { BackofficeAPI, StoreManagerAPI } from '@/services'
import { useS3ManagerStore } from '@/store/store'
import ColorChoice from '@/components/common/ColorChoice/ColorChoice'
import RibbonBadge from '@/components/common/RibbonBadge/RibbonBadge'
import {
  CUSTOM_ICON,
  DEFAULT_RIBBON_COLOR,
  ProductRibbon,
  RIBBON_ICONS,
  customIconSrc,
  ribbonIdFromLabel,
} from '@/shared/helpers/productIcons'

const MAX_ICON_BYTES = 512 * 1024

/**
 * The ribbons of the shop: name, color and icon (one of the shop's or an
 * uploaded picture). Products get them on Stock & extras; the shop shows them
 * on the product's card and page.
 */
const RibbonsSettings: React.FC<{
  value: ProductRibbon[]
  onChange: (next: ProductRibbon[]) => void
}> = ({ value, onChange }) => {
  const [usage, setUsage] = useState<Record<string, number>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  // ribbons added on this visit: their id follows the name until saved
  const [fresh, setFresh] = useState<string[]>([])
  const { getS3FormData } = useS3ManagerStore()

  useEffect(() => {
    BackofficeAPI.getProductRibbonUsage().then((data) => setUsage(data ?? {}))
  }, [])

  const update = (index: number, patch: Partial<ProductRibbon>) =>
    onChange(value.map((ribbon, i) => (i === index ? { ...ribbon, ...patch } : ribbon)))

  const rename = (index: number, label: string) => {
    const ribbon = value[index]
    if (!fresh.includes(ribbon.id)) return update(index, { label })
    const id = ribbonIdFromLabel(label, value.filter((_, i) => i !== index).map((other) => other.id))
    setFresh((ids) => ids.map((other) => (other === ribbon.id ? id : other)))
    update(index, { label, id })
  }

  const move = (index: number, by: number) => {
    const next = [...value]
    const [item] = next.splice(index, 1)
    next.splice(index + by, 0, item)
    onChange(next)
  }

  const add = () => {
    const label = tx('New ribbon')
    const id = ribbonIdFromLabel(`${label} ${value.length + 1}`, value.map((ribbon) => ribbon.id))
    setFresh((ids) => [...ids, id])
    onChange([
      ...value,
      {
        id,
        label,
        color: DEFAULT_RIBBON_COLOR,
        icon: 'star',
      },
    ])
  }

  const remove = (index: number) => {
    const used = usage[value[index].id] ?? 0
    if (used > 0 && !window.confirm(tx('{count} products have this ribbon. Remove it from them too?', { count: used }))) {
      return
    }
    onChange(value.filter((_, i) => i !== index))
  }

  // the picture goes to the image bucket like the product images; the ribbon
  // keeps its key and the shop loads it from there
  const upload = async (index: number, file?: File) => {
    if (!file) return
    if (file.size > MAX_ICON_BYTES) {
      toast(tx('The icon can be at most 512 KB.'), { type: 'error', autoClose: 3000 })
      return
    }
    const id = value[index].id
    setUploading(id)
    const s3Data = await getS3FormData()
    let uploaded = false
    if (s3Data?.url) {
      const formData = new FormData()
      for (const [key, field] of Object.entries(s3Data.fields)) {
        formData.append(key, field as string)
      }
      formData.append('file', file)
      uploaded = await StoreManagerAPI.uploadImagesOnS3(formData, s3Data.url)
      if (uploaded) update(index, { icon: `${CUSTOM_ICON}${s3Data.fields.key}` })
    }
    setUploading(null)
    toast(uploaded ? tx('Icon uploaded. Save the settings to keep it.') : tx('Upload failed'), {
      type: uploaded ? 'success' : 'error',
      autoClose: 2500,
    })
  }

  const iconButton = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border transition ${
      active
        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-300 dark:bg-purple-900/40 dark:text-purple-200'
        : 'border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
    }`

  return (
    <div className="space-y-4">
      {value.map((ribbon, index) => {
        const used = usage[ribbon.id] ?? 0
        const custom = ribbon.icon.startsWith(CUSTOM_ICON)
        return (
          <div key={index} className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-44 shrink-0">
                <RibbonBadge ribbon={ribbon} />
              </div>
              <TextInput
                className="w-full sm:w-64"
                sizing="sm"
                maxLength={30}
                value={ribbon.label}
                placeholder={tx('Name')}
                onChange={(e) => rename(index, e.target.value)}
              />
              <span className="flex-1 text-xs text-gray-500 dark:text-gray-400">
                {used > 0 ? tx('Products: {count}', { count: used }) : tx('Not used')}
              </span>
              <div className="flex items-center gap-1">
                <Button size="xs" color="gray" disabled={index === 0} onClick={() => move(index, -1)} title={tx('Move up')}>
                  <HiArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  size="xs"
                  color="gray"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                  title={tx('Move down')}
                >
                  <HiArrowDown className="h-4 w-4" />
                </Button>
                <Button size="xs" color="failure" onClick={() => remove(index)} title={tx('Remove')}>
                  <HiTrash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ColorChoice size="sm" value={ribbon.color} onChange={(color) => update(index, { color: color ?? DEFAULT_RIBBON_COLOR })} />

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                title={tx('No icon')}
                onClick={() => update(index, { icon: '' })}
                className={iconButton(ribbon.icon === '')}
              >
                <HiBan className="h-4 w-4" />
              </button>
              {Object.entries(RIBBON_ICONS).map(([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  type="button"
                  title={tx(label)}
                  onClick={() => update(index, { icon: key })}
                  className={iconButton(ribbon.icon === key)}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
              {custom && (
                <span className={iconButton(true)} title={tx('Uploaded icon')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={customIconSrc(ribbon.icon)} className="h-5 w-5 object-contain" />
                </span>
              )}
              <label
                className={`ml-1 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-gray-300 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ${
                  uploading === ribbon.id ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {uploading === ribbon.id ? <Spinner size="xs" /> : <HiUpload className="h-4 w-4" />}
                {custom ? tx('Upload another icon') : tx('Upload an icon')}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/svg+xml,image/webp"
                  onChange={(e) => {
                    upload(index, e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          </div>
        )
      })}
      {value.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{tx('No ribbons yet.')}</p>}

      <Button size="sm" color="gray" onClick={add}>
        <HiPlus className="mr-1 h-4 w-4" /> {tx('Add a ribbon')}
      </Button>
    </div>
  )
}

export default RibbonsSettings
