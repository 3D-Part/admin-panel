'use client'

import React, { SyntheticEvent, useRef, useState } from 'react'
import { ProductsAPI, StoreManagerAPI } from '@/services'
import { ProductImagesFormBody } from '@/shared/types'
import { useProductsStore, useS3ManagerStore } from '@/store/store'
import UploadFiles from '@/components/common/Dropzone/UploadFiles'
import { Button } from 'flowbite-react'
import { toast } from 'react-toastify'

const UploadImages = () => {
  const [loader, setLoader] = useState(false)

  const formDataRef = useRef<File[]>([] as File[])

  const { activeProduct, changeActiveProduct } = useProductsStore()
  const { getS3FormData } = useS3ManagerStore()

  const setActiveFormData = (files: File[]) => {
    formDataRef.current = files
  }

  const processFiles = async (file: File) => {
    const formData = new FormData()
    const s3FData = await getS3FormData()

    if (!s3FData) {
      return
    }

    for (const [key, value] of Object.entries(s3FData.fields)) {
      formData.append(key, value)
    }
    formData.append('file', file)

    const URL = s3FData.url
    const data = await StoreManagerAPI.uploadImagesOnS3(formData, URL)

    if (data) {
      const _body: ProductImagesFormBody = {
        imageId: s3FData.fields.key,
        productId: activeProduct.id,
        isMain: false,
      }
      const res = await ProductsAPI.addProductImage(_body)

      if (res) {
        const _productData = await ProductsAPI.getOneProduct(activeProduct.id)
        if (_productData) {
          changeActiveProduct(_productData)
        }
        toast('Image is uploaded!', {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
        })
        setLoader(false)
        return
      }
    }
  }

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formDataRef.current.length) return
    setLoader(true)

    // Send request for each file
    formDataRef.current.forEach((file) => {
      processFiles(file)
    })
  }
  return (
    <div className="relative flex flex-wrap gap-4 w-full mt-4">
      <h2 className="text-2xl font-extrabold leading-none tracking-tight text-gray-800 md:text-2xl dark:text-white">
        Upload Files
      </h2>
      <form onSubmit={onSubmit} className="w-full">
        <UploadFiles setActiveFormData={setActiveFormData} />
        <Button
          disabled={loader}
          className="mt-6"
          type="submit"
          isProcessing={loader}
        >
          Upload
        </Button>
      </form>
    </div>
  )
}

export default UploadImages
