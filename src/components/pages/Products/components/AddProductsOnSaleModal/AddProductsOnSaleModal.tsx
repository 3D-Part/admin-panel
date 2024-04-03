'use client'

import {
  DeleteProductsOnSaleFormData,
  PatchProductOnSaleData,
  ProductOnSale,
  ProductOnSaleData,
  Sale,
} from '@/shared/types'
import {
  useProductsStore,
  useSalesSliceStore,
  useUISliceStore,
} from '@/store/store'
import { SalesAPI } from '@/services'

import { Button, Label, Modal, Select, TextInput } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const AddProductsOnSaleModal = () => {
  const [loading, setLoading] = useState(false)

  const [productOnSelectedSale, setProductOnSelectedSale] =
    useState<ProductOnSale | null>(null)

  const { activeProduct } = useProductsStore()

  const { changeIsAddProductsOnSaleModalOpen, isAddProductsOnSaleModalOpen } =
    useUISliceStore()
  const { allSales, activeSale, changeActiveSale, fetchAllSales } =
    useSalesSliceStore()

  const salesDataRef = useRef<ProductOnSaleData>({} as ProductOnSaleData)
  const formRef = useRef<HTMLFormElement>(null)

  const changeActiveSaleData = (saleId: string) => {
    const selectedSale = allSales.find((sale) => sale.id === saleId)

    if (selectedSale) {
      changeActiveSale(selectedSale)
    } else {
      changeActiveSale({} as Sale)
    }
  }

  const checkIsProductInSelectedSale = () => {
    if (!activeSale?.id) {
      setProductOnSelectedSale(null)
      return
    }
    const productOnSale = activeSale?.productOnSale.find((product) => {
      return product.productId === activeProduct.id
    })

    if (productOnSale) {
      setProductOnSelectedSale(productOnSale)
    } else {
      setProductOnSelectedSale(null)
    }
  }

  useEffect(() => {
    if (!isAddProductsOnSaleModalOpen) return
    checkIsProductInSelectedSale()
  }, [activeSale])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    const _value = name === 'discountedPrice' ? Number(value) : value

    salesDataRef.current = {
      ...salesDataRef.current,
      [name]: _value,
    }

    if (name === 'saleId') {
      changeActiveSaleData(value)
      // checkIsProductInSelectedSale()
    }
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    salesDataRef.current = {} as ProductOnSaleData
    setProductOnSelectedSale(null)
  }

  const closeModal = () => {
    changeIsAddProductsOnSaleModalOpen(false)
  }

  const onSave = async () => {
    salesDataRef.current.productId = activeProduct.id

    setLoading(true)

    let response
    let message = ''
    if (productOnSelectedSale) {
      const patchBody: PatchProductOnSaleData[] = [
        {
          id: productOnSelectedSale.id,
          discountedPrice: salesDataRef.current.discountedPrice,
        },
      ]
      message = 'Product on sale is changed'
      response = await SalesAPI.updateProductOnSale(patchBody)
    } else {
      const addBody = [salesDataRef.current]
      message = 'Product is added on sale'
      response = await SalesAPI.addProductOnSale(addBody)
    }

    if (response) {
      toast(message, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    await fetchAllSales()
    setLoading(false)
    changeIsAddProductsOnSaleModalOpen(false)
  }

  const onDelete = async () => {
    if (!productOnSelectedSale) return
    setLoading(true)

    const body: DeleteProductsOnSaleFormData = {
      ids: [productOnSelectedSale.id],
    }

    const response = await SalesAPI.deleteProductOnSale(body)
    if (response) {
      toast('Product is remove from sale', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'warning',
      })
    }
    changeActiveSale({} as Sale)
    await fetchAllSales()
    setLoading(false)
  }

  useEffect(() => {
    resetData()
  }, [isAddProductsOnSaleModalOpen])

  return (
    <Modal dismissible show={isAddProductsOnSaleModalOpen} onClose={closeModal}>
      <Modal.Header>
        <div className="flex items-center justify-center gap-2">
          Add <i>&quot;{activeProduct.name}&quot;</i> on sale
        </div>
      </Modal.Header>
      <Modal.Body>
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-md flex-col gap-4"
        >
          {/* SALES */}
          <div className="w-full" id="select">
            <div className="mb-2 block">
              <Label
                htmlFor="saleId"
                value={`Sale ${
                  productOnSelectedSale
                    ? '(product is already in this sale)'
                    : ''
                }`}
              />
            </div>
            <Select
              onChange={handleInputChange}
              name="saleId"
              id="saleId"
              required
            >
              <option value={''}>None</option>
              {allSales.map((sale) => {
                return (
                  <option value={sale.id} key={sale.id}>
                    {sale.name}
                  </option>
                )
              })}
            </Select>
          </div>
          {/* Discount */}
          <div className="w-full">
            <div className="mb-2 block">
              <Label htmlFor="discountedPrice" value="Discount price" />
            </div>
            <TextInput
              name="discountedPrice"
              onChange={handleInputChange}
              id="discountedPrice"
              required
              type="text"
              defaultValue={
                productOnSelectedSale
                  ? productOnSelectedSale.discountedPrice
                  : ''
              }
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button isProcessing={loading} disabled={loading} onClick={onSave}>
          Save
        </Button>
        {productOnSelectedSale && (
          <Button
            color="red"
            isProcessing={loading}
            disabled={loading}
            onClick={onDelete}
          >
            Remove
          </Button>
        )}

        <Button disabled={loading} color="gray" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default AddProductsOnSaleModal
