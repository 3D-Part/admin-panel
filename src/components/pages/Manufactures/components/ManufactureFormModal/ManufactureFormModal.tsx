'use client'

import { Loader } from '@/components/common'
import { ManufacturerFormBody, ManufacturerData } from '@/shared/types'
import { useManufactureStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import { useEffect, useRef } from 'react'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

type ModalType = {
  isOpen: boolean
  initialValue?: ManufacturerData
  onSave: (manufacturer: ManufacturerFormBody) => void
  onClose: () => void
}

const ManufactureFormModal: React.FC<ModalType> = ({
  isOpen,
  initialValue,
  onSave,
  onClose,
}) => {
  const manufacturerDataRef = useRef<ManufacturerData>({} as ManufacturerData)

  const { currentPageManufactures } = useManufactureStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    manufacturerDataRef.current = {
      ...manufacturerDataRef.current,
      [name]: value,
    }
  }

  const resetData = () => {
    manufacturerDataRef.current = {} as ManufacturerData
  }

  const saveFunction = () => {
    if (!manufacturerDataRef.current.name) return

    const _manufacturer: ManufacturerFormBody = {
      name: manufacturerDataRef.current.name,
    }

    onSave(_manufacturer)
    resetData()
  }

  useEffect(() => {
    if (!initialValue) return

    manufacturerDataRef.current = initialValue
  }, [initialValue])

  // Disable body scroll when modal is open
  useModalScroll(isOpen)

  if (!isOpen) return null

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose} size="lg">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              {initialValue ? 'Edit Manufacturer' : 'Add New Manufacturer'}
            </span>
            {initialValue && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {initialValue.name}
              </span>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          {currentPageManufactures.length > 0 ? (
            <form className="space-y-6">
              {/* Manufacturer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Manufacturer Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="manufacturerName"
                      value="Manufacturer Name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    />
                    <TextInput
                      name="name"
                      onChange={handleInputChange}
                      id="manufacturerName"
                      required
                      type="text"
                      defaultValue={initialValue?.name ? initialValue.name : ''}
                      className="mt-1"
                      placeholder="Enter manufacturer name..."
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
              disabled={!manufacturerDataRef.current.name}
            >
              {initialValue ? 'Update Manufacturer' : 'Create Manufacturer'}
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

export default ManufactureFormModal
