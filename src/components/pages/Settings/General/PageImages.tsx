'use client'

import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Label, Select, TextInput } from 'flowbite-react'
import { HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { StoreManagerAPI } from '@/services'
import { useCategoryStore, useS3ManagerStore } from '@/store/store'

export type PageImage = {
  id: string
  page: string
  desktop: string
  mobile: string
  alt: string
  link: string
  active: boolean
}

const S3_URL = process.env.S3_URL

const PageImages: React.FC<{
  value: PageImage[]
  onChange: (value: PageImage[]) => void
}> = ({ value, onChange }) => {
  const { fetchAllCategories, allCategories } = useCategoryStore()
  const { getS3FormData } = useS3ManagerStore()
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchAllCategories()
  }, [fetchAllCategories])

  const change = (id: string, changes: Partial<PageImage>) =>
    onChange(value.map((image) => (image.id === id ? { ...image, ...changes } : image)))

  const upload = async (file: File): Promise<string | null> => {
    const s3Data = await getS3FormData()
    if (!s3Data) return null

    const formData = new FormData()
    for (const [key, field] of Object.entries(s3Data.fields)) {
      formData.append(key, field)
    }
    formData.append('file', file)
    const uploaded = await StoreManagerAPI.uploadImagesOnS3(formData, s3Data.url)
    return uploaded ? s3Data.fields.key : null
  }

  const uploadTo = async (
    id: string,
    field: 'desktop' | 'mobile',
    file?: File
  ) => {
    if (!file) return
    setUploading(true)
    const key = await upload(file)
    setUploading(false)
    if (key) {
      change(id, { [field]: key })
    } else {
      toast('Upload failed', { type: 'error', autoClose: 2000 })
    }
  }

  return (
    <div className="space-y-4">
      {value.map((image) => (
        <div
          key={image.id}
          className="grid gap-3 sm:grid-cols-2 p-3 border border-gray-200 dark:border-gray-700 rounded"
        >
          <div>
            <Label htmlFor={`page-${image.id}`} value="Page" />
            <Select
              id={`page-${image.id}`}
              value={image.page}
              onChange={(e) => change(image.id, { page: e.target.value })}
            >
              <option value="home">Home page</option>
              <option value="all">All products</option>
              {allCategories.map((category) => (
                <option key={category.id} value={`category:${category.slug}`}>
                  Category: {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor={`link-${image.id}`} value="Link when clicked (optional)" />
            <TextInput
              id={`link-${image.id}`}
              value={image.link}
              placeholder="/shop/sale"
              onChange={(e) => change(image.id, { link: e.target.value })}
            />
          </div>
          {(['desktop', 'mobile'] as const).map((field) => (
            <div key={field}>
              <Label
                htmlFor={`${field}-${image.id}`}
                value={
                  field === 'desktop'
                    ? 'Desktop image, 2880 x 1080'
                    : 'Phone image, 1080 x 1680'
                }
              />
              <input
                id={`${field}-${image.id}`}
                type="file"
                accept="image/webp,image/jpeg,image/png"
                disabled={uploading}
                className="block w-full text-sm text-gray-900 dark:text-white"
                onChange={(e) => uploadTo(image.id, field, e.target.files?.[0])}
              />
              {image[field] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  src={`${S3_URL}/${image[field]}`}
                  className="mt-2 h-16 rounded object-cover"
                />
              )}
            </div>
          ))}
          <div>
            <Label htmlFor={`alt-${image.id}`} value="Image description, for Google" />
            <TextInput
              id={`alt-${image.id}`}
              value={image.alt}
              onChange={(e) => change(image.id, { alt: e.target.value })}
            />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`active-${image.id}`}
                checked={image.active}
                onChange={(e) => change(image.id, { active: e.target.checked })}
              />
              <Label htmlFor={`active-${image.id}`} value="Shown on the site" />
            </div>
            <Button
              size="xs"
              color="failure"
              aria-label="Remove image"
              onClick={() => onChange(value.filter((x) => x.id !== image.id))}
            >
              <HiTrash />
            </Button>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        color="gray"
        onClick={() =>
          onChange([
            ...value,
            {
              id: `${Date.now()}`,
              page: 'home',
              desktop: '',
              mobile: '',
              alt: '',
              link: '',
              active: true,
            },
          ])
        }
      >
        Add image
      </Button>
    </div>
  )
}

export default PageImages
