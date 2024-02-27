'use client'

import { Loader } from '@/components/common'
import { useAttributesStore } from '@/store/store'
import { Button, Label, Select } from 'flowbite-react'
import React, { useEffect, useRef, useState } from 'react'
import { AttributeData } from '@/shared/types'
import AddAttributeForm from './components/AddAttributeForm/AddAttributeForm'

const AddAttribute = () => {
  const [loader, setLoader] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeData>(
    {} as AttributeData
  )

  const resetSelectedAttribute = () => {
    setSelectedAttribute({} as AttributeData)
  }
  const attributeDataRef = useRef<string>('')

  const { allAttributes, fetchAllAttributes } = useAttributesStore()

  const getAllAttributes = async () => {
    setLoader(true)
    await fetchAllAttributes()
    setLoader(false)
  }

  // TODO need to be cached
  // useEffect(() => {
  //   if (allAttributes.length !== 0) return;
  //   fetchAllAttributes();
  // }, [allAttributes, fetchAllAttributes]);
  useEffect(() => {
    getAllAttributes()
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target

    attributeDataRef.current = value
  }

  const addAttribute = () => {
    const _selectedAttribute = allAttributes.find(
      (attribute) => attribute.id === attributeDataRef.current
    )
    _selectedAttribute && setSelectedAttribute(_selectedAttribute)
  }

  if (loader) return <Loader />
  if (!allAttributes.length)
    return (
      <div className="mt-4 text-white text-xl">
        There is no attributes available
      </div>
    )

  return (
    <div className="flex flex-wrap w-full ">
      <div className="w-full flex justify-start items-end gap-4">
        <div className="min-w-[200px]" id="select">
          <div className="mb-2 block">
            <Label htmlFor="attribute" value="Attribute" />
          </div>
          <Select
            onChange={handleInputChange}
            name="attributeId"
            id="attribute"
            // required
            // defaultValue={activeProduct.attributeId}
          >
            <option value={''}>None</option>
            {allAttributes.map((attribute) => {
              return (
                <option value={attribute.id} key={attribute.id}>
                  {attribute.name}
                </option>
              )
            })}
          </Select>
        </div>

        <Button onClick={addAttribute}>Add Attribute</Button>
      </div>

      {selectedAttribute.id && (
        <AddAttributeForm
          attribute={selectedAttribute}
          resetData={resetSelectedAttribute}
        />
      )}
    </div>
  )
}

export default AddAttribute
