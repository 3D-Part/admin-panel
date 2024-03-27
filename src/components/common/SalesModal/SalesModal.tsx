'use client'

import { SalesFormData } from '@/shared/types'
import { useUISliceStore } from '@/store/store'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import React, { useEffect, useRef } from 'react'

const SalesModal = () => {
  const test = true

  const { changeIsSalesModalOpen, isSalesModalOpen } = useUISliceStore()

  const salesDataRef = useRef<SalesFormData>({} as SalesFormData)
  const formRef = useRef<HTMLFormElement>(null)

  const closeModal = () => {
    changeIsSalesModalOpen(false)
  }

  const resetData = () => {
    formRef.current && formRef.current.reset()
    salesDataRef.current = {} as SalesFormData
  }

  useEffect(() => {
    resetData()
  }, [isSalesModalOpen])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    salesDataRef.current = {
      ...salesDataRef.current,
      [name]: value,
    }
  }

  return (
    <Modal dismissible show={isSalesModalOpen} onClose={closeModal}>
      <Modal.Header>
        <div className="flex items-center justify-center gap-2">
          {' '}
          Sales{' '}
          <div
            className={`w-2 h-2 rounded-full ${
              test ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className="flex max-w-md flex-col gap-4"
        >
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
              // defaultValue={startTimeFormated}
              defaultValue={''}
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
              // defaultValue={endTimeFormated}
              defaultValue={''}
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal}>Save</Button>
        <Button color="purple" onClick={closeModal}>
          Remove
        </Button>
        <Button color="gray" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SalesModal
