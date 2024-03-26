'use client'

import { WarningModal } from '@/components/common'
import SubscribersAPI from '@/services/subscibers'
import { Order, SubscribersEmailBody } from '@/shared/types'
import { Button, Label, Modal, TextInput, Textarea } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

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
    console.log('response:', response)
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
      <Modal dismissible show={isOpen} onClose={onClose}>
        <Modal.Header>Send email to all subscribers</Modal.Header>
        <Modal.Body>
          <form
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
            className="flex max-w-md flex-col gap-4"
          >
            {/* Subject */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="subject" value="Subject" />
              </div>
              <TextInput
                name="subject"
                onChange={handleInputChange}
                id="subject"
                required
                type="text"
                defaultValue=""
              />
            </div>

            {/* Headline */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="headline" value="Headline" />
              </div>
              <TextInput
                name="headline"
                onChange={handleInputChange}
                id="headline"
                required
                type="text"
                defaultValue=""
              />
            </div>

            {/* Content */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="content" value="Message" />
              </div>
              <Textarea
                onChange={handleInputChange}
                id="content"
                name="content"
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
          message="Do you want to send email to subscribers?"
          isLoading={loading}
          buttonColor="blue"
        />
      )}
    </>
  )
}

export default SubscribersContactForm
