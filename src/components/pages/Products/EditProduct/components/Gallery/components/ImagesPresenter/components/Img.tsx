'use client'
import { WarningModal } from '@/components/common'
import { ProductsAPI } from '@/services'
import { useProductsStore } from '@/store/store'
import { Spinner } from 'flowbite-react'
import Image from 'next/image'
import { useState } from 'react'
import { HiStar, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'

type ImgType = {
  src: string
  id: string
  isMain: boolean
}

const Img: React.FC<ImgType> = ({ src, id, isMain }) => {
  const [loader, setLoader] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFavoriteModal, setIsFavoriteModal] = useState(false)

  const { removeProductImage, editProductImage } = ProductsAPI
  const { activeProduct, changeActiveProduct } = useProductsStore()

  const updateProduct = async () => {
    const _productData = await ProductsAPI.getOneProduct(activeProduct.id)
    if (_productData) {
      changeActiveProduct(_productData)
    }
  }

  const removeImage = async () => {
    setLoader(true)
    const res = await removeProductImage(id)
    if (res) {
      updateProduct()
      setLoader(false)
      setIsModalOpen(false)

      toast('Image is removed!', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      return
    }
    setLoader(false)
    setIsModalOpen(false)
  }

  const changeFavoriteImage = async () => {
    setLoader(true)
    const _body = {
      isMain: true,
    }

    const res = await editProductImage(id, _body)

    if (res) {
      updateProduct()
      setLoader(false)
      setIsFavoriteModal(false)

      toast('Image is set as main!', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      return
    }
    setLoader(false)
    setIsFavoriteModal(false)
  }

  return (
    <div className="group relative flex justify-center items-center border border-gray-800 rounded-lg w-40 h-40 md:w-52 md:h-52">
      <Image
        className="object-cover w-full h-full rounded-lg"
        src={src}
        width={208}
        height={208}
        alt={id}
      />

      <div className="z-10 transition-all ease-in-out absolute top-0 left-0 w-full h-full flex items-center justify-center gap-4 rounded-lg bg-black/[.92] opacity-0 group-hover:opacity-100 ">
        {!isMain && (
          <HiStar
            onClick={() => setIsFavoriteModal(true)}
            className="cursor-pointer text-4xl text-white hover:text-yellow-300"
          />
        )}
        <HiTrash
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer text-4xl text-red-500 hover:text-red-700"
        />
      </div>

      {isMain && (
        <HiStar className="absolute top-0 right-0  cursor-pointer text-4xl text-yellow-300" />
      )}

      {loader && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center gap-4 rounded-lg bg-black/[.92]">
          <Spinner aria-label="Loading Categories" size="lg" />
        </div>
      )}

      <WarningModal
        isOpen={isModalOpen}
        onSave={removeImage}
        onClose={() => setIsModalOpen(false)}
      />

      <WarningModal
        isOpen={isFavoriteModal}
        onSave={changeFavoriteImage}
        onClose={() => setIsFavoriteModal(false)}
        message="Set this as main image?"
        buttonColor="blue"
      />
    </div>
  )
}

export default Img
