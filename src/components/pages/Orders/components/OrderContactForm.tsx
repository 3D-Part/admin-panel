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

    setLoading(true)

    const _body = {
      message: declineMessageRef.current,
    }

    const response = await orderContactMessage(initialValue.id, _body)

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
      <Modal dismissible show={isOpen} onClose={onClose} size="lg">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              Send Message
            </span>
            {initialValue && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                to {initialValue.email}
              </span>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          <form className="space-y-6">
            {/* Message Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Content
              </h3>
              <div>
                <Label
                  htmlFor="declineMessage"
                  value="Your message"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <Textarea
                  onChange={handleInputChange}
                  id="declineMessage"
                  name="description"
                  placeholder="Write your message here..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              isProcessing={loading}
              disabled={loading}
              onClick={saveFunction}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Send Message
            </Button>
            <Button
              disabled={loading}
              color="gray"
              onClick={onClose}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Cancel
            </Button>
          </div>
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
