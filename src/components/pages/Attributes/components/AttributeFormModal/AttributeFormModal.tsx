'use client'

import { Loader } from '@/components/common'
import { AttributeFormBody, AttributeData } from '@/shared/types'
import { useAttributesStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import { useEffect, useRef } from 'react'

type ModalType = {
  isOpen: boolean
  initialValue?: AttributeData
  onSave: (attribute: AttributeFormBody) => void
  onClose: () => void
}

const AttributeFormModal: React.FC<ModalType> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
}) => {
  const attributeDataRef = useRef<AttributeData>({} as AttributeData)

  const { allAttributes } = useAttributesStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    attributeDataRef.current = {
      ...attributeDataRef.current,
      [name]: value,
    }
  }

  const resetData = () => {
    attributeDataRef.current = {} as AttributeData
  }

  const saveFunction = () => {
    if (!attributeDataRef.current.name) return

    const _attribute: AttributeFormBody = {
      name: attributeDataRef.current.name,
    }

    onSave(_attribute)
    resetData()
  }

  useEffect(() => {
    if (!initialValue) return

    attributeDataRef.current = initialValue
  }, [initialValue])

  if (!isOpen) return null

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose} size="lg">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              {initialValue ? 'Edit Attribute' : 'Add New Attribute'}
            </span>
            {initialValue && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {initialValue.name}
              </span>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          {allAttributes.length > 0 ? (
            <form className="space-y-6">
              {/* Attribute Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Attribute Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="attributeName"
                      value="Attribute Name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                      name="name"
                      onChange={handleInputChange}
                      id="attributeName"
                      required
                      type="text"
                      defaultValue={initialValue?.name ? initialValue.name : ''}
                      className="mt-1"
                      placeholder="Enter attribute name..."
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              onClick={saveFunction}
              className="w-full sm:w-auto order-2 sm:order-1"
              disabled={!attributeDataRef.current.name}
            >
              {initialValue ? 'Update Attribute' : 'Create Attribute'}
            </Button>
            <Button
              color="gray"
              onClick={onClose}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default AttributeFormModal
