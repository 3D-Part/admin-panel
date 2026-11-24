'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Label, Radio, Select, TextInput, Textarea } from 'flowbite-react'
import { HiArrowDown, HiArrowUp, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { ProductsAPI, StoreManagerAPI } from '@/services'
import { useS3ManagerStore } from '@/store/store'
import { WarehouseProduct } from '@/shared/types/warehouse'

/**
 * Content banners (settings `contentBanners`): slides of the home slider the
 * site draws from their parts, next to the image slides above them.
 */
export type ContentBanner = {
  id: string
  active: boolean
  title: string
  text: string
  buttonLabel: string
  buttonLink: string
  background: 'color' | 'image'
  backgroundColor: string
  backgroundImage: string
  textColor: 'light' | 'dark'
  productImage: string
  productId: string
}

const S3_URL = process.env.S3_URL
const LINK = /^(\/(?!\/)\S*|https?:\/\/\S+)$/
const HEX = /^#[0-9a-fA-F]{6}$/

export const readContentBanners = (settings: any): ContentBanner[] =>
  Array.isArray(settings?.contentBanners) ? settings.contentBanners : []

/** Why the banners cannot be saved, or null. */
export const contentBannersProblem = (banners: ContentBanner[]) => {
  for (const banner of banners) {
    if (!banner.title.trim()) return 'Every content banner needs a title.'
    if (banner.buttonLabel.trim() && !LINK.test(banner.buttonLink.trim()))
      return 'A content banner with a button needs its link: a page of the shop (/shop/...) or https://...'
    if (!HEX.test(banner.backgroundColor)) return 'Pick the background color of every content banner.'
    if (banner.background === 'image' && !banner.backgroundImage)
      return 'Upload the background picture of the content banner, or pick a color.'
  }
  return null
}

const newBanner = (taken: string[]): ContentBanner => {
  let id = ''
  do id = `cb-${Math.random().toString(36).slice(2, 10)}`
  while (taken.includes(id))
  return {
    id,
    active: true,
    title: '',
    text: '',
    buttonLabel: 'Pogledaj ponudu',
    buttonLink: '/shop/sale',
    background: 'color',
    backgroundColor: '#1e3a8a',
    backgroundImage: '',
    textColor: 'light',
    productImage: '',
    productId: '',
  }
}

const imageSrc = (key: string) => `${S3_URL}/${key}`

/** Roughly how the slide looks on the site (desktop). */
export const ContentBannerPreview: React.FC<{ banner: ContentBanner }> = ({ banner }) => (
  <div
    className="relative flex min-h-[180px] items-center gap-4 overflow-hidden rounded-xl bg-cover bg-center p-6"
    style={{
      backgroundColor: banner.backgroundColor,
      backgroundImage:
        banner.background === 'image' && banner.backgroundImage ? `url(${imageSrc(banner.backgroundImage)})` : undefined,
      color: banner.textColor === 'light' ? '#ffffff' : '#101010',
    }}
  >
    <div className="flex flex-1 flex-col gap-2">
      <div className="text-2xl font-bold leading-tight">{banner.title || tx('Title')}</div>
      {banner.text && <div className="line-clamp-3 text-sm opacity-90">{banner.text}</div>}
      {banner.buttonLabel && (
        <span
          className={`mt-1 w-fit rounded-lg px-4 py-2 text-sm font-semibold ${
            banner.textColor === 'light' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
          }`}
        >
          {banner.buttonLabel} →
        </span>
      )}
    </div>
    {banner.productImage && (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" src={imageSrc(banner.productImage)} className="h-36 w-36 shrink-0 object-contain" />
    )}
  </div>
)

/** Search the products and take the main picture of the picked one. */
const ProductPicturePicker: React.FC<{ onPick: (product: { id: string; image: string; name: string }) => void }> = ({
  onPick,
}) => {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<WarehouseProduct[]>([])

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(() => {
      ProductsAPI.searchProducts(search.trim(), 0, 8).then((data) => setResults(data?.rows ?? []))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const pick = async (product: WarehouseProduct) => {
    const full: any = await ProductsAPI.getOneProduct(product.id)
    const images: { imageId: string; isMain?: boolean }[] = full?.images ?? []
    const main = images.find((image) => image.isMain) ?? images[0]
    if (!main) {
      toast(tx('This product has no picture.'), { type: 'error', autoClose: 2500 })
      return
    }
    onPick({ id: product.id, image: main.imageId, name: product.name })
    setSearch('')
    setResults([])
  }

  return (
    <div className="relative">
      <TextInput
        sizing="sm"
        value={search}
        placeholder={tx('Or take the picture of a product: search by name or code')}
        onChange={(e) => setSearch(e.target.value)}
      />
      {results.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
              onClick={() => pick(product)}
            >
              {product.name} <span className="text-gray-500 dark:text-gray-400">{product.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const ContentBannersSettings: React.FC<{
  value: ContentBanner[]
  onChange: (next: ContentBanner[]) => void
}> = ({ value, onChange }) => {
  const { getS3FormData } = useS3ManagerStore()
  const [uploading, setUploading] = useState(false)

  const update = (id: string, patch: Partial<ContentBanner>) =>
    onChange(value.map((banner) => (banner.id === id ? { ...banner, ...patch } : banner)))

  const move = (index: number, by: number) => {
    const next = [...value]
    const [banner] = next.splice(index, 1)
    next.splice(index + by, 0, banner)
    onChange(next)
  }

  // stored in the image bucket like the product images
  const upload = async (id: string, field: 'backgroundImage' | 'productImage', file?: File) => {
    if (!file) return
    setUploading(true)
    const s3Data = await getS3FormData()
    let uploaded = false
    if (s3Data?.url) {
      const formData = new FormData()
      for (const [key, part] of Object.entries(s3Data.fields)) {
        formData.append(key, part as string)
      }
      formData.append('file', file)
      uploaded = await StoreManagerAPI.uploadImagesOnS3(formData, s3Data.url)
      if (uploaded) {
        update(id, field === 'productImage' ? { productImage: String(s3Data.fields.key), productId: '' } : { backgroundImage: String(s3Data.fields.key) })
      }
    }
    setUploading(false)
    if (!uploaded) toast(tx('Upload failed'), { type: 'error', autoClose: 2500 })
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tx('No content slides yet. A content slide is made of a title, a text, a button, a background and a product picture, so it needs no designed image.')}
        </p>
      )}
      {value.map((banner, index) => (
        <div key={banner.id} className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`cb-active-${banner.id}`}
                checked={banner.active}
                onChange={(e) => update(banner.id, { active: e.target.checked })}
              />
              <Label htmlFor={`cb-active-${banner.id}`} value={tx('Shown on the site')} />
            </div>
            <div className="flex gap-1">
              <Button size="xs" color="gray" disabled={index === 0} aria-label={tx('Move up')} onClick={() => move(index, -1)}>
                <HiArrowUp />
              </Button>
              <Button
                size="xs"
                color="gray"
                disabled={index === value.length - 1}
                aria-label={tx('Move down')}
                onClick={() => move(index, 1)}
              >
                <HiArrowDown />
              </Button>
              <Button
                size="xs"
                color="failure"
                aria-label={tx('Remove')}
                onClick={() => onChange(value.filter((item) => item.id !== banner.id))}
              >
                <HiTrash />
              </Button>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <div>
                <Label htmlFor={`cb-title-${banner.id}`} value={tx('Title')} />
                <TextInput
                  id={`cb-title-${banner.id}`}
                  value={banner.title}
                  maxLength={80}
                  onChange={(e) => update(banner.id, { title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`cb-text-${banner.id}`} value={tx('Text')} />
                <Textarea
                  id={`cb-text-${banner.id}`}
                  rows={2}
                  maxLength={400}
                  value={banner.text}
                  onChange={(e) => update(banner.id, { text: e.target.value })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`cb-button-${banner.id}`} value={tx('Button text (empty: no button)')} />
                  <TextInput
                    id={`cb-button-${banner.id}`}
                    value={banner.buttonLabel}
                    maxLength={30}
                    onChange={(e) => update(banner.id, { buttonLabel: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor={`cb-link-${banner.id}`} value={tx('Link')} />
                  <TextInput
                    id={`cb-link-${banner.id}`}
                    value={banner.buttonLink}
                    placeholder="/shop/sale"
                    onChange={(e) => update(banner.id, { buttonLink: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label value={tx('Background')} />
                  <div className="mt-1 flex gap-4">
                    {(['color', 'image'] as const).map((kind) => (
                      <div key={kind} className="flex items-center gap-2">
                        <Radio
                          id={`cb-bg-${kind}-${banner.id}`}
                          name={`cb-bg-${banner.id}`}
                          checked={banner.background === kind}
                          onChange={() => update(banner.id, { background: kind })}
                        />
                        <Label htmlFor={`cb-bg-${kind}-${banner.id}`} value={tx(kind === 'color' ? 'Color' : 'Picture')} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor={`cb-textcolor-${banner.id}`} value={tx('Text color')} />
                  <Select
                    id={`cb-textcolor-${banner.id}`}
                    sizing="sm"
                    value={banner.textColor}
                    onChange={(e) => update(banner.id, { textColor: e.target.value as ContentBanner['textColor'] })}
                  >
                    <option value="light">{tx('Light (on a dark background)')}</option>
                    <option value="dark">{tx('Dark (on a light background)')}</option>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="color"
                  aria-label={tx('Background color')}
                  value={banner.backgroundColor}
                  onChange={(e) => update(banner.id, { backgroundColor: e.target.value })}
                  className="h-9 w-14 cursor-pointer rounded border border-gray-300 bg-transparent dark:border-gray-600"
                />
                {banner.background === 'image' && (
                  <div>
                    <Label htmlFor={`cb-bgimage-${banner.id}`} value={tx('Background picture, wide (about 2880 x 1080)')} />
                    <input
                      id={`cb-bgimage-${banner.id}`}
                      type="file"
                      accept="image/webp,image/jpeg,image/png"
                      disabled={uploading}
                      className="block text-sm text-gray-900 dark:text-white"
                      onChange={(e) => upload(banner.id, 'backgroundImage', e.target.files?.[0])}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`cb-product-${banner.id}`} value={tx('Product picture (optional, a transparent PNG looks best)')} />
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id={`cb-product-${banner.id}`}
                    type="file"
                    accept="image/webp,image/jpeg,image/png"
                    disabled={uploading}
                    className="block text-sm text-gray-900 dark:text-white"
                    onChange={(e) => upload(banner.id, 'productImage', e.target.files?.[0])}
                  />
                  {banner.productImage && (
                    <Button size="xs" color="gray" onClick={() => update(banner.id, { productImage: '', productId: '' })}>
                      {tx('No product picture')}
                    </Button>
                  )}
                </div>
                <ProductPicturePicker
                  onPick={(product) => {
                    update(banner.id, { productImage: product.image, productId: product.id })
                    toast(tx('Picture of {name} taken.', { name: product.name }), { type: 'success', autoClose: 2000 })
                  }}
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{tx('Preview')}</p>
              <ContentBannerPreview banner={banner} />
            </div>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        color="gray"
        disabled={value.length >= 10}
        onClick={() => onChange([...value, newBanner(value.map((banner) => banner.id))])}
      >
        {tx('Add content slide')}
      </Button>
    </div>
  )
}

export default ContentBannersSettings
