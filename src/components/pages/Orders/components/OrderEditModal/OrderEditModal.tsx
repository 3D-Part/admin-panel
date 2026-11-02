'use client'
import { modalRoot } from '@/shared/helpers/modalRoot'

import { ORDER_STATUS_EMAILS, ORDER_STATUS_FLOW, OrderStatusEnum } from '@/shared/enums'
import executeOrderAction from '@/shared/helpers/executeOrderAction'
import getOrderStatusStyle from '@/shared/helpers/getOrderStatusStyle'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'
import { OrdersAPI } from '@/services'
import { Order, PaginationData } from '@/shared/types'
import { useOrdersStore } from '@/store/store'
import { Badge, Button, Dropdown, Label, Modal, Textarea } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useModalScroll } from '@/shared/hooks/useModalScroll'

type ModalType = {
  isOpen: boolean
  initialValue?: Order
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  onClose: () => void
}

const OrderEditModal: React.FC<ModalType> = ({
  isOpen,
  setIsModalOpen,
  initialValue,
  // onSave,
  onClose,
}) => {
  const { Item } = Dropdown

  const [activeStatus, setActiveStatus] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [loading, setLoading] = useState(false)

  const declineMessageRef = useRef('')

  const orderStatus = ORDER_STATUS_FLOW

  const { currentPage, itemsPerPage, fetchOrders } = useOrdersStore()

  useEffect(() => {
    if (!initialValue) return

    setActiveStatus(initialValue.status)
    setInternalNote(initialValue.internalNote ?? '')
  }, [initialValue])

  useEffect(() => {
    declineMessageRef.current = ''
  }, [activeStatus])

  // Disable body scroll when modal is open
  useModalScroll(isOpen)

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { value } = e.target

    declineMessageRef.current = value
  }

  const fetchOrdersData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    }
    await fetchOrders(paginationData)
  }

  const saveFunction = async () => {
    if (!initialValue) return

    let response
    setLoading(true)

    if (internalNote !== (initialValue.internalNote ?? '')) {
      await OrdersAPI.orderUpdateNote(initialValue.id, internalNote)
    }

    if (activeStatus === initialValue.status) {
      await fetchOrdersData()
      setLoading(false)
      setIsModalOpen(false)
      return
    }

    if (activeStatus === OrderStatusEnum.Declined) {
      const _body = {
        message: declineMessageRef.current,
      }

      response = await executeOrderAction(initialValue.id, activeStatus, _body)
    } else {
      response = await executeOrderAction(initialValue.id, activeStatus)
    }

    await fetchOrdersData()

    setLoading(false)
    setIsModalOpen(false)

    if (response) {
      toast(`Order status is changed!`, {
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
              Update Order Status
            </span>
            {initialValue && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Order #{initialValue.orderNumber}
              </span>
            )}
          </div>
        </Modal.Header>

        <Modal.Body className="space-y-6">
          <form className="space-y-6">
            {/* Status Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Status
              </h3>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="orderStatus"
                    value="Select new status"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  />
                  <Dropdown
                    label={activeStatus ? getOrderStatusLabel(activeStatus) : 'Select status'}
                    className="mt-1 !bg-gray-700"
                  >
                    {orderStatus.map((status) => {
                      const statusStyle = getOrderStatusStyle(status)

                      return (
                        <Item
                          key={status}
                          onClick={() => setActiveStatus(status)}
                          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 p-2"
                        >
                          <Badge
                            className={`justify-center w-full ${statusStyle}`}
                          >
                            {getOrderStatusLabel(status)}
                          </Badge>
                        </Item>
                      )
                    })}
                  </Dropdown>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    You can move an order to any status, also back. Stock follows
                    by itself: New, Offer, Returned and Cancelled hold no stock,
                    every other status does.
                  </p>
                  {activeStatus !== initialValue?.status &&
                    ORDER_STATUS_EMAILS[activeStatus as OrderStatusEnum] && (
                      <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                        {ORDER_STATUS_EMAILS[activeStatus as OrderStatusEnum]}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Decline Message */}
            {activeStatus === OrderStatusEnum.Declined && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Decline Message
                </h3>
                <div>
                  <Label
                    htmlFor="declineMessage"
                    value="Reason for declining"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  />
                  <Textarea
                    onChange={handleInputChange}
                    id="declineMessage"
                    name="description"
                    placeholder="Please provide a reason for declining this order..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            {/* Internal note */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Note
              </h3>
              <div>
                <Label
                  htmlFor="internalNote"
                  value="Internal note, the customer does not see it"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                />
                <Textarea
                  id="internalNote"
                  name="internalNote"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. the customer wants the invoice on the company"
                  rows={3}
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
              Update Status
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
    </>
  )
}

export default OrderEditModal
