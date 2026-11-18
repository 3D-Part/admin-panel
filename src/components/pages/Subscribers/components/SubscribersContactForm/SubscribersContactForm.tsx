'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'

import { WarningModal } from '@/components/common'
import SubscribersAPI from '@/services/subscibers'
import { Order, SubscribersEmailBody } from '@/shared/types'
import { Button, Label, Modal, Radio, TextInput, Textarea } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

type ModalType = {
  isOpen: boolean
  initialValue?: Order
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
  // the subscribers ticked in the table
  selected?: string[]
}

const SubscribersContactForm: React.FC<ModalType> = ({
  isOpen,
  setIsModalOpen,
  onClose,
  selected = [],
}) => {
  const [loading, setLoading] = useState(false)
  const [who, setWho] = useState<'all' | 'selected'>('all')
  const chosen = who === 'selected' && selected.length > 0
  useEffect(() => {
    if (isOpen) setWho(selected.length > 0 ? 'selected' : 'all')
  }, [isOpen, selected.length])
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

    const _body = { ...emailDataRef.current, ...(chosen ? { emails: selected } : {}) }

    const response = await sendMailToAllSubscribers(_body)
    setLoading(false)
    setIsModalOpen(false)
    setIsWarningModalOpen(false)

    if (response !== null) {
      toast(tx("Email is sent!"), {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
  }

  return (
    <>
      <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="lg">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 dark:text-white">
              {tx("Send Email to Subscribers")}
            </span>
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          <fieldset className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <legend className="mb-1 font-medium">{tx('Recipients')}</legend>
            <label className="flex items-center gap-2">
              <Radio name="sc-who" checked={!chosen} onChange={() => setWho('all')} />
              {tx('All subscribers')}
            </label>
            <label className={`flex items-center gap-2 ${selected.length ? '' : 'opacity-50'}`}>
              <Radio name="sc-who" checked={chosen} disabled={selected.length === 0} onChange={() => setWho('selected')} />
              {tx('Only the subscribers ticked in the table')} ({selected.length})
            </label>
          </fieldset>
          <form ref={formRef} className="space-y-6">
            {/* Email Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {tx("Email Information")}
              </h3>
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <Label
                    htmlFor="subject"
                    value={tx("Email Subject")}
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
                    placeholder={tx("Enter email subject...")}
                  />
                </div>

                {/* Headline */}
                <div>
                  <Label
                    htmlFor="headline"
                    value={tx("Email Headline")}
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
                    placeholder={tx("Enter email headline...")}
                  />
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {tx("Message Content")}
              </h3>
              <div>
                <Label
                  htmlFor="content"
                  value={tx("Email message")}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <Textarea
                  onChange={handleInputChange}
                  id="content"
                  name="content"
                  placeholder={tx("Write your email message here...")}
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
              {tx("Send Email")}
            </Button>
            <Button
              disabled={loading}
              color="gray"
              onClick={onClose}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {tx("Cancel")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {isWarningModalOpen && (
        <WarningModal
          isOpen={isWarningModalOpen}
          onSave={sendEmail}
          onClose={() => setIsWarningModalOpen(false)}
          message={
            chosen
              ? tx('Send to the {count} ticked subscribers only?', { count: selected.length })
              : tx('Send to ALL subscribers?')
          }
          isLoading={loading}
          buttonColor="blue"
        />
      )}
    </>
  )
}

export default SubscribersContactForm
