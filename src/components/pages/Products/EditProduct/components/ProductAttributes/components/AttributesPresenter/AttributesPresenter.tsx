'use client'

import { useProductsStore } from '@/store/store'
import React from 'react'
import EmptyAttributes from './components/EmptyAttributes/EmptyAttributes'
import AttributeEditForm from './components/AttributeEditForm/AttributeEditForm'

const AttributesPresenter = () => {
  const { activeProduct } = useProductsStore()
  const productAttributes = activeProduct.productAttributes

  if (!productAttributes && activeProduct?.productAttributes?.length === 0)
    return <EmptyAttributes />

  return (
    <div>
      <h2 className="text-white text-3xl font-bold mb-6">
        Product attributes:
      </h2>
      <div className="flex flex-wrap gap-5 justify-start">
        {productAttributes &&
          productAttributes.map((attribute) => {
            return (
              <AttributeEditForm
                key={attribute.id}
                // TODO don't condition after backend fix
                name={
                  attribute.attribute?.name
                    ? attribute.attribute.name
                    : 'attribute name'
                }
                value={attribute.value}
                attributeId={attribute.id}
              />
            )
          })}
      </div>
    </div>
  )
}

export default AttributesPresenter
