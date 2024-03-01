'use client'

import { PromoCodeFormBody } from '@/shared/types'
import { usePromoCodesSliceStore } from '@/store/store'
import { Button, Label, TextInput } from 'flowbite-react'
import React, { SyntheticEvent, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Loader } from '@/components/common'
import PromoCodeHeader from './components/Header/Header'

type AddNewPromoCodeType = {
  initialValue?: PromoCodeFormBody
}

const AddNewPromoCode: React.FC<AddNewPromoCodeType> = ({ initialValue }) => {
  const [loader, setLoader] = useState(false)
  const promoCodeDataRef = useRef<PromoCodeFormBody>({} as PromoCodeFormBody)
  const formRef = useRef<HTMLFormElement>(null)

  const { addNewPromoCode } = usePromoCodesSliceStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    promoCodeDataRef.current = {
      ...promoCodeDataRef.current,
      [name]: value,
    }
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    promoCodeDataRef.current = {} as PromoCodeFormBody
  }

  const saveFunction = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    console.log('promoCodeDataRef.current:', promoCodeDataRef.current)

    if (!promoCodeDataRef.current.code) return

    const _promoCode: PromoCodeFormBody = {
      code: promoCodeDataRef.current.code,
      startsAt: promoCodeDataRef.current.startsAt,
      endsAt: promoCodeDataRef.current.endsAt,
      discountPercentage: promoCodeDataRef.current.discountPercentage,
    }

    const request = await addNewPromoCode(_promoCode)

    if (request) {
      toast(`${_promoCode.code} is added!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })

      resetData()
    }
  }

  if (loader) {
    return (
      <div className="flex flex-col  w-full ">
        <PromoCodeHeader />
        <Loader />
      </div>
    )
  }

  return (
    <div className="flex flex-col  w-full ">
      <PromoCodeHeader />

      <form
        ref={formRef}
        onSubmit={saveFunction}
        className="flex flex-col items-start gap-4 w-full max-w-xl  "
      >
        {/* CODE NAME */}
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="code" value="Name (Code)  " />
          </div>
          <TextInput
            name="code"
            onChange={handleInputChange}
            id="code"
            required
            type="text"
            defaultValue={initialValue?.code ? initialValue.code : ''}
          />
        </div>

        {/* DISCOUNT */}
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="discountPercentage" value="Discount percentage" />
          </div>
          <TextInput
            name="discountPercentage"
            onChange={handleInputChange}
            id="discountPercentage"
            required
            type="text"
            defaultValue={
              initialValue?.discountPercentage
                ? initialValue.discountPercentage
                : ''
            }
          />
        </div>

        {/* START DATE */}
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="startsAt" value="Start time" />
          </div>
          <TextInput
            name="startsAt"
            onChange={handleInputChange}
            id="startsAt"
            required
            type="datetime-local"
            defaultValue={initialValue?.startsAt ? initialValue.startsAt : ''}
          />
        </div>

        {/* END DATE */}
        <div className="w-full">
          <div className="mb-2 block">
            <Label htmlFor="endsAt" value="End time" />
          </div>
          <TextInput
            name="endsAt"
            onChange={handleInputChange}
            id="endsAt"
            required
            type="datetime-local"
            defaultValue={initialValue?.endsAt ? initialValue.endsAt : ''}
          />
        </div>

        <Button className="mt-6" type="submit">
          Save
        </Button>
      </form>
    </div>
  )
}

export default AddNewPromoCode
