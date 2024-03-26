'use client'

import { WarningModal } from '@/components/common'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import { Button, Label, Modal, Textarea } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type ModalType = {
  isOpen: boolean
  initialValue?: Order
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
}

const OrderContactForm: React.FC<ModalType> = ({
  isOpen,
  setIsModalOpen,
  initialValue,
  // onSave,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)

  const declineMessageRef = useRef('')

  useEffect(() => {
    declineMessageRef.current = ''
  }, [])

  const { orderContactMessage } = OrdersAPI

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { value } = e.target

    declineMessageRef.current = value
  }

  const saveFunction = () => {
    setIsWarningModalOpen(true)
  }

  const sendEmail = async () => {
    if (!initialValue) return

    let response
    setLoading(true)

    const _body = {
      message: declineMessageRef.current,
    }

    response = await orderContactMessage(initialValue.id, _body)

    setLoading(false)
    setIsModalOpen(false)
    setIsWarningModalOpen(false)

    if (response !== null) {
      toast(`Message is sent!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
  }

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose}>
        <Modal.Header>{`Send message to ${initialValue?.email}`}</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex max-w-md flex-col gap-4"
          >
            <div>
              <div className="mb-2 block">
                <Label htmlFor="declineMessage" value="Message" />
              </div>
              <Textarea
                onChange={handleInputChange}
                id="declineMessage"
                name="description"
                placeholder="write a message ..."
                rows={4}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            isProcessing={loading}
            disabled={loading}
            onClick={saveFunction}
          >
            Send
          </Button>
          <Button disabled={loading} color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {isWarningModalOpen && (
        <WarningModal
          isOpen={isWarningModalOpen}
          onSave={sendEmail}
          onClose={() => setIsWarningModalOpen(false)}
          message={`Do you want to send message to ${initialValue?.email}`}
          isLoading={loading}
          buttonColor="blue"
        />
      )}
    </>
  )
}

export default OrderContactForm
