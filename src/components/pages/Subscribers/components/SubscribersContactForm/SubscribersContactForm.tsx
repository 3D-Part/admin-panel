'use client'

import { WarningModal } from '@/components/common'
import SubscribersAPI from '@/services/subscibers'
import { Order, SubscribersEmailBody } from '@/shared/types'
import { Button, Label, Modal, TextInput, Textarea } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

type ModalType = {
  isOpen: boolean
  initialValue?: Order
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
}

const SubscribersContactForm: React.FC<ModalType> = ({
  isOpen,
  setIsModalOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false)
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false)

  const emailDataRef = useRef<SubscribersEmailBody>({} as SubscribersEmailBody)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // reset data on load
    emailDataRef.current = {} as SubscribersEmailBody
    formRef.current && formRef.current.reset()
  }, [])

  // Disable body scroll when modal is open
  useModalScroll(isOpen)

  const { sendMailToAllSubscribers } = SubscribersAPI

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target

    emailDataRef.current = {
      ...emailDataRef.current,
      [name]: value,
    }
  }

  const saveFunction = () => {
    setIsWarningModalOpen(true)
  }

  const sendEmail = async () => {
    setLoading(true)

    const _body = emailDataRef.current

    const response = await sendMailToAllSubscribers(_body)
    setLoading(false)
    setIsModalOpen(false)
    setIsWarningModalOpen(false)

    if (response !== null) {
      toast(`Email is sent!`, {
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
              Send Email to Subscribers
            </span>
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          <form ref={formRef} className="space-y-6">
            {/* Email Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Email Information
              </h3>
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <Label
                    htmlFor="subject"
                    value="Email Subject"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  />
                  <TextInput
                    name="subject"
                    onChange={handleInputChange}
                    id="subject"
                    required
                    type="text"
                    defaultValue=""
                    className="mt-1"
                    placeholder="Enter email subject..."
                  />
                </div>

                {/* Headline */}
                <div>
                  <Label
                    htmlFor="headline"
                    value="Email Headline"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  />
                  <TextInput
                    name="headline"
                    onChange={handleInputChange}
                    id="headline"
                    required
                    type="text"
                    defaultValue=""
                    className="mt-1"
                    placeholder="Enter email headline..."
                  />
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Message Content
              </h3>
              <div>
                <Label
                  htmlFor="content"
                  value="Email message"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <Textarea
                  onChange={handleInputChange}
                  id="content"
                  name="content"
                  placeholder="Write your email message here..."
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
              color="purple"
            >
              Send Email
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
          message="Do you want to send email to subscribers?"
          isLoading={loading}
          buttonColor="blue"
        />
      )}
    </>
  )
}

export default SubscribersContactForm
