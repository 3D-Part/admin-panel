'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'

import { OrdersAPI } from '@/services'
import { Order, PaginationData } from '@/shared/types'
import { useOrdersStore } from '@/store/store'
import { Button, Label, Modal, Textarea } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

type ModalType = {
  isOpen: boolean
  initialValue?: Order
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
}

/**
 * Opens from the Status column. The status itself is set only with the
 * checkboxes of the Invoice column (their steps come from Settings), so this
 * window keeps just the internal note of the order.
 */
const OrderEditModal: React.FC<ModalType> = ({
  isOpen,
  setIsModalOpen,
  initialValue,
  onClose,
}) => {
  const [internalNote, setInternalNote] = useState('')
  const [loading, setLoading] = useState(false)

  const { currentPage, itemsPerPage, fetchOrders } = useOrdersStore()

  useEffect(() => {
    if (!initialValue) return
    setInternalNote(initialValue.internalNote ?? '')
  }, [initialValue])

  // Disable body scroll when modal is open
  useModalScroll(isOpen)

  const saveFunction = async () => {
    if (!initialValue) return

    setLoading(true)
    if (internalNote !== (initialValue.internalNote ?? '')) {
      const saved = await OrdersAPI.orderUpdateNote(initialValue.id, internalNote)
      if (saved) {
        toast(tx('Note saved'), {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'success',
        })
      }
    }

    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchOrders(paginationData)
    setLoading(false)
    setIsModalOpen(false)
  }

  return (
    <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="lg">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            {tx('Note')}
          </span>
          {initialValue && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Order #{initialValue.orderNumber}
            </span>
          )}
        </div>
      </Modal.Header>

      <Modal.Body className="space-y-4">
        <div>
          <Label
            htmlFor="internalNote"
            value={tx('Internal note, the customer does not see it')}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          />
          <Textarea
            id="internalNote"
            name="internalNote"
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder={tx('e.g. the customer wants the invoice on the company')}
            rows={4}
            className="mt-1"
          />
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button
            isProcessing={loading}
            disabled={loading}
            onClick={saveFunction}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {tx('Save note')}
          </Button>
          <Button
            disabled={loading}
            color="gray"
            onClick={onClose}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {tx('Cancel')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderEditModal
