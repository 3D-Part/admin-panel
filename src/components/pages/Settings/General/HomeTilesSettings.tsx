'use client'
import { tx } from '@/shared/i18n'

import React, { useState } from 'react'
import { Button, Label, TextInput, Textarea } from 'flowbite-react'
import { toast } from 'react-toastify'
import { StoreManagerAPI } from '@/services'
import { useS3ManagerStore } from '@/store/store'

/**
 * The two tiles under the home slider (settings `homeTiles`). An empty image
 * is the tile's own picture that comes with the site; the same files are in
 * this app's public/assets/home-tiles for the preview.
 */
export type HomeTile = {
  id: string
  title: string
  text: string
  buttonLabel: string
  link: string
  image: string
}

export const DEFAULT_HOME_TILES: HomeTile[] = [
  {
    id: 'filaments',
    title: '3D filamenti',
    text: 'Pronađite savršeni filament za vaše 3D projekte! Bilo da radite sa PLA, ABS ili TPU, kvalitetan materijal je ključ za vrhunske rezultate. Eksperimentišite i kreirajte bez ograničenja!',
    buttonLabel: 'Pogledaj ponudu',
    link: '/shop/category/filamenti',
    image: '',
  },
  {
    id: 'printers',
    title: '3D printeri',
    text: 'Otključajte svijet mogućnosti uz vrhunske 3D štampače! Preciznost, pouzdanost i lakoća korišćenja za svaki vaš projekat. Kreirajte budućnost već danas!',
    buttonLabel: 'Pogledaj ponudu',
    link: '/shop/category/3d-printeri',
    image: '',
  },
]

const DEFAULT_PICTURES: Record<string, string> = {
  filaments: '/assets/home-tiles/filament.png',
  printers: '/assets/home-tiles/printer.png',
}
// the backgrounds of the two tiles on the site
const BACKGROUNDS = ['#eff6ff', '#9bc7fc']

export const readHomeTiles = (settings: any): HomeTile[] =>
  Array.isArray(settings?.homeTiles) && settings.homeTiles.length === DEFAULT_HOME_TILES.length
    ? settings.homeTiles.map((tile: HomeTile, i: number) => ({ ...DEFAULT_HOME_TILES[i], ...tile }))
    : DEFAULT_HOME_TILES

const LINK = /^(\/(?!\/)\S*|https?:\/\/\S+)$/

/** Why the tiles cannot be saved, or null. */
export const homeTilesProblem = (tiles: HomeTile[]) => {
  if (tiles.some((tile) => !tile.title.trim())) return 'Every tile needs a title.'
  if (tiles.some((tile) => !LINK.test(tile.link.trim())))
    return 'Every tile needs a link: a page of the shop (/shop/...) or https://...'
  return null
}

const tileImageSrc = (tile: HomeTile) =>
  tile.image ? `${process.env.S3_URL}/${tile.image}` : DEFAULT_PICTURES[tile.id]

const HomeTilesSettings: React.FC<{
  value: HomeTile[]
  onChange: (next: HomeTile[]) => void
}> = ({ value, onChange }) => {
  const { getS3FormData } = useS3ManagerStore()
  const [uploading, setUploading] = useState<number | null>(null)

  const update = (index: number, patch: Partial<HomeTile>) =>
    onChange(value.map((tile, i) => (i === index ? { ...tile, ...patch } : tile)))

  // stored in the image bucket like the product images
  const upload = async (index: number, file?: File) => {
    if (!file) return
    setUploading(index)
    const s3Data = await getS3FormData()
    let uploaded = false
    if (s3Data?.url) {
      const formData = new FormData()
      for (const [key, field] of Object.entries(s3Data.fields)) {
        formData.append(key, field as string)
      }
      formData.append('file', file)
      uploaded = await StoreManagerAPI.uploadImagesOnS3(formData, s3Data.url)
      if (uploaded) update(index, { image: String(s3Data.fields.key) })
    }
    setUploading(null)
    if (!uploaded) toast(tx('Upload failed'), { type: 'error', autoClose: 2500 })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {value.map((tile, index) => (
        <div key={tile.id} className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {tx(index === 0 ? 'Left tile' : 'Right tile')}
          </h3>
          <div>
            <Label htmlFor={`tile-title-${tile.id}`} value={tx('Title')} />
            <TextInput
              id={`tile-title-${tile.id}`}
              value={tile.title}
              maxLength={60}
              onChange={(e) => update(index, { title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`tile-text-${tile.id}`} value={tx('Text')} />
            <Textarea
              id={`tile-text-${tile.id}`}
              rows={3}
              value={tile.text}
              maxLength={400}
              onChange={(e) => update(index, { text: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`tile-button-${tile.id}`} value={tx('Button text')} />
              <TextInput
                id={`tile-button-${tile.id}`}
                value={tile.buttonLabel}
                maxLength={30}
                placeholder="Pogledaj ponudu"
                onChange={(e) => update(index, { buttonLabel: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`tile-link-${tile.id}`} value={tx('Link')} />
              <TextInput
                id={`tile-link-${tile.id}`}
                value={tile.link}
                placeholder="/shop/category/filamenti"
                onChange={(e) => update(index, { link: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`tile-image-${tile.id}`} value={tx('Picture (square or 4:3 looks best)')} />
            <div className="flex flex-wrap items-center gap-2">
              <input
                id={`tile-image-${tile.id}`}
                type="file"
                accept="image/webp,image/jpeg,image/png"
                disabled={uploading !== null}
                className="block text-sm text-gray-900 dark:text-white"
                onChange={(e) => upload(index, e.target.files?.[0])}
              />
              {tile.image && (
                <Button size="xs" color="gray" onClick={() => update(index, { image: '' })}>
                  {tx("Use the site's picture")}
                </Button>
              )}
            </div>
          </div>
          {/* roughly how the site shows it */}
          <div className="rounded-2xl p-4 text-[#101010]" style={{ background: BACKGROUNDS[index] }}>
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={tileImageSrc(tile)} className="h-32 w-2/5 rounded-lg object-cover" />
              <div className="flex w-3/5 flex-col gap-2">
                <div className="text-xl font-bold">{tile.title}</div>
                <div className="line-clamp-4 text-xs">{tile.text}</div>
                <div className="w-fit rounded-lg border border-black px-3 py-1 text-xs font-semibold">
                  {tile.buttonLabel || 'Pogledaj ponudu'} →
                </div>
              </div>
            </div>
          </div>
          <Button size="xs" color="gray" onClick={() => update(index, DEFAULT_HOME_TILES[index])}>
            {tx('Back to the original tile')}
          </Button>
        </div>
      ))}
    </div>
  )
}

export default HomeTilesSettings
