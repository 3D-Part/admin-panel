'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'

import { WarningModal } from '@/components/common'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import { Button, Label, Modal, Select, Textarea } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { MESSAGE_TEMPLATES, fillTemplate } from '@/shared/helpers/messageTemplates'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

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

  // the message is empty each time the form opens
  const [message, setMessage] = useState('')
  const [templateId, setTemplateId] = useState('')
  useEffect(() => {
    if (isOpen) {
      setMessage('')
      setTemplateId('')
    }
  }, [isOpen])

  const pickTemplate = (id: string) => {
    setTemplateId(id)
    const template = MESSAGE_TEMPLATES.find((item) => item.id === id)
    if (template && initialValue) setMessage(fillTemplate(template, initialValue))
  }

  // Disable body scroll when modal is open
  useModalScroll(isOpen)

  const { orderContactMessage } = OrdersAPI

  const saveFunction = () => {
    setIsWarningModalOpen(true)
  }

  const sendEmail = async () => {
    if (!initialValue) return

    setLoading(true)

    const _body = {
      message,
    }

    const response = await orderContactMessage(initialValue.id, _body)

    setLoading(false)
    setIsModalOpen(false)
    setIsWarningModalOpen(false)

    if (response !== null) {
      toast(tx("Message is sent!"), {
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
              {tx("Email the customer")}
            </span>
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          <form className="space-y-6">
            {/* where it goes */}
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200">
              <p>
                <span className="text-gray-500 dark:text-gray-400">{tx("To")}: </span>
                {initialValue?.fullName} &lt;{initialValue?.email}&gt;
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">{tx("Subject")}: </span>
                {tx("New message about your order")} {initialValue?.orderNumber}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {tx("The customer gets your text and a summary of the order. They reply to the shop's e-mail address; the message is not kept in the admin.")}
              </p>
            </div>

            <div>
              <Label
                htmlFor="messageTemplate"
                value={tx("Template")}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              />
              <Select
                id="messageTemplate"
                value={templateId}
                onChange={(e) => pickTemplate(e.target.value)}
                className="mt-1"
              >
                <option value="">{tx("Write your own")}</option>
                {MESSAGE_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {tx(template.label)}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label
                htmlFor="declineMessage"
                value={tx("Your message")}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              />
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                id="declineMessage"
                name="description"
                placeholder={tx("Write your message here...")}
                rows={8}
                className="mt-1"
              />
            </div>
          </form>
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              isProcessing={loading}
              disabled={loading || !message.trim()}
              onClick={saveFunction}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              {tx("Send Message")}
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
          message={tx("Do you want to send message to {email}", { email: initialValue?.email })}
          isLoading={loading}
          buttonColor="blue"
        />
      )}
    </>
  )
}

export default OrderContactForm
