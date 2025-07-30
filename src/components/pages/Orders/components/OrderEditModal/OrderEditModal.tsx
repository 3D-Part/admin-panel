'use client'

import { OrderStatusEnum } from '@/shared/enums'
import executeOrderAction from '@/shared/helpers/executeOrderAction'
import getOrderStatusStyle from '@/shared/helpers/getOrderStatusStyle'
import { Order, PaginationData } from '@/shared/types'
import { useOrdersStore } from '@/store/store'
import { Badge, Button, Dropdown, Label, Modal, Textarea } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

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
  const [loading, setLoading] = useState(false)

  const declineMessageRef = useRef('')

  const orderStatus = [
    OrderStatusEnum.Pending,
    OrderStatusEnum.Accepted,
    OrderStatusEnum.Declined,
    OrderStatusEnum.Shipping,
    OrderStatusEnum.Finished,
  ]

  const { currentPage, itemsPerPage, fetchOrders } = useOrdersStore()

  useEffect(() => {
    if (!initialValue) return

    setActiveStatus(initialValue.status)
  }, [initialValue])

  useEffect(() => {
    declineMessageRef.current = ''
  }, [activeStatus])

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
      <Modal dismissible show={isOpen} onClose={onClose} size="lg">
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
                    label={activeStatus ? activeStatus : 'Select status'}
                    className="mt-1"
                  >
                    {orderStatus.map((status) => {
                      const statusStyle = getOrderStatusStyle(status)

                      return (
                        <Item
                          key={status}
                          onClick={() => setActiveStatus(status)}
                        >
                          <Badge
                            className={`justify-center w-full ${statusStyle}`}
                          >
                            {status}
                          </Badge>
                        </Item>
                      )
                    })}
                  </Dropdown>
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
          </form>
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              isProcessing={loading}
              disabled={loading || !activeStatus}
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
