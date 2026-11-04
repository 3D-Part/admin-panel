'use client'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { CustomerProfileForm } from '@/components/common/CustomerFlag/CustomerFlag'

import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'
import OrderDetails from '@/components/pages/Orders/components/OrderDetails'
import { User, Order } from '@/shared/types'
import { Button, Modal, Table, TextInput, Label, Select } from 'flowbite-react'
import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import UsersAPI from '@/services/users'
import { BackofficeAPI } from '@/services'
import { CustomerTier } from '@/services/backoffice'

const tierName = (tier: string | null) =>
  tier ? `${tier[0]}${tier.slice(1).toLowerCase()}` : 'No tier'

type UserDetailType = {
  name: string
  value: string | null
  className?: string
  vertical?: boolean
}

const UserDetail: React.FC<UserDetailType> = ({
  value,
  name,
  vertical,
  className = '',
}) => {
  return (
    <div
      className={`className flex justify-between  gap-4 flex-1 basis-[48%] rounded-lg bg-gray-100 dark:bg-slate-600 text-gray-900 dark:text-white p-3 ${
        vertical ? 'flex-col items-start' : 'items-center'
      }`}
    >
      <p className="font-semibold">{name}</p>
      <span className="text-gray-600 dark:text-gray-300">
        {value ? value : '-'}
      </span>
    </div>
  )
}

type OrderWrapperType = {
  order: Order
  onClick: (activeOrder: Order) => void
}
const OrderWrapper: React.FC<OrderWrapperType> = ({ order, onClick }) => {
  const { orderNumber, price, products, status, total } = order

  return (
    <Table.Row
      onClick={() => onClick(order)}
      className="bg-white dark:border-gray-700 dark:bg-gray-800"
    >
      <Table.Cell className="cursor-pointer">{orderNumber}</Table.Cell>
      <Table.Cell>{price}</Table.Cell>
      <Table.Cell>{products.length}</Table.Cell>
      <Table.Cell>{getOrderStatusLabel(status)}</Table.Cell>
      <Table.Cell>{total}KM</Table.Cell>
    </Table.Row>
  )
}

type UserDetailsType = {
  user: User
  isOpen: boolean
  onClose: () => void
  onUserUpdated?: (updatedUser: User) => void
}

const UserDetails: React.FC<UserDetailsType> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}) => {
  const [isOrderDetailsVisible, setIsOrderDetailsVisible] = useState(false)
  const [activeOrder, setActiveOrder] = useState<Order>({} as Order)
  const discountRef = useRef<HTMLInputElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)

  const sendPasswordReset = async () => {
    setIsSendingReset(true)
    const sent = await UsersAPI.sendPasswordResetEmail(user.email)
    setIsSendingReset(false)
    toast(
      sent
        ? `Email sent to ${user.email}. The customer picks the new password.`
        : 'The email could not be sent',
      { type: sent ? 'success' : 'error', autoClose: 3000 }
    )
  }

  const {
    id,
    fullName,
    email,
    role,
    provider,
    phone,
    state,
    city,
    postCode,
    street,
    orders,
    availablePoints,
    usedPoints,
    reservedPoints,
  } = user

  const [tier, setTier] = useState((user as any).tier ?? '')
  const [tierInfo, setTierInfo] = useState<CustomerTier | null>(null)

  useEffect(() => {
    BackofficeAPI.getCustomerTier(id).then(setTierInfo)
  }, [id, tier])

  const handleTierChange = async (value: string) => {
    const previous = tier
    setTier(value)
    setIsUpdating(true)
    const result = await UsersAPI.updateUserProfile(id, {
      tier: value || null,
    } as any)
    setIsUpdating(false)
    if (result) {
      toast('Tier updated', { hideProgressBar: true, autoClose: 2000, type: 'success' })
      if (onUserUpdated) onUserUpdated(result)
    } else {
      setTier(previous)
    }
  }

  const selectActiveOrder = (activeOrder: Order) => {
    setActiveOrder(activeOrder)
    setIsOrderDetailsVisible(true)
  }

  const handleDiscountSave = async () => {
    const discountValue = Number(discountRef.current?.value || '0') || 0
    // same limits as the API
    if (
      !Number.isInteger(discountValue) ||
      discountValue < 0 ||
      discountValue > 40
    ) {
      toast('Discount must be a whole number between 0 and 40', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
      return
    }

    setIsUpdating(true)
    const result = await UsersAPI.updateUserProfile(id, {
      discount: discountValue,
    })
    setIsUpdating(false)

    if (result) {
      toast('Discount updated successfully!', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
      if (onUserUpdated) {
        onUserUpdated(result)
      }
    } else {
      toast('Failed to update discount', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
    }
  }

  return (
    <>
      <Modal root={modalRoot()}
        className={`${isOrderDetailsVisible ? 'hiddne' : ''}`}
        dismissible
        show={isOpen}
        onClose={onClose}
        size="4xl"
      >
        <Modal.Header>
          User ID: <span className="text-gray-400">#{id}</span>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-wrap gap-4">
            <UserDetail
              className="cursor-pointer"
              name="Full name:"
              value={fullName}
            />
            <UserDetail name="Email:" value={email} />
            <UserDetail name="Phone:" value={phone} />
            <UserDetail name="State:" value={state} />
            <UserDetail name="City:" value={city} />
            <UserDetail name="Street:" value={street} />
            <UserDetail name="Post Code:" value={postCode} />
            <UserDetail name="Role:" value={role} />
            <UserDetail name="Provider:" value={provider} />
            <div className="flex w-full flex-wrap gap-4">
              <UserDetail
                name="Available points:"
                value={String(availablePoints)}
              />

              <UserDetail name="Used points:" value={String(usedPoints)} />
              <UserDetail
                name="Reserved points:"
                value={String(reservedPoints)}
              />
            </div>

            <div className="w-full mt-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label htmlFor="customer-tier" value="Discount tier" />
              <div className="flex gap-3 items-center mt-1">
                <Select
                  id="customer-tier"
                  value={tier}
                  onChange={(e) => handleTierChange(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="">No tier</option>
                  <option value="BRONZE">Bronze</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                </Select>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Set by hand. Percentages and thresholds are in Settings →
                  Discount tiers
                </span>
              </div>
              {tierInfo && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  Spent {tierInfo.spend.toFixed(2)} KM
                  {tierInfo.period === '12m' ? ' in the last 12 months' : ' in total'}
                  {tierInfo.spendTier && `, enough for ${tierName(tierInfo.spendTier)}`}
                  . The customer gets{' '}
                  <strong>{tierName(tierInfo.tier)}</strong>.
                </p>
              )}
            </div>

            <CustomerProfileForm email={email} />

            {/* Discount Section */}
            <div className="w-full mt-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <Label
                htmlFor="discount"
                value="User Discount (%)"
                className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 block"
              />
              <div className="flex gap-3 items-center">
                <TextInput
                  id="discount"
                  type="number"
                  min="0"
                  max="40"
                  step="1"
                  ref={discountRef}
                  defaultValue={user.discount || 0}
                  placeholder="0"
                  className="w-32"
                />
                <span className="text-gray-500 dark:text-gray-400">%</span>
                <Button
                  size="sm"
                  color="purple"
                  onClick={handleDiscountSave}
                  isProcessing={isUpdating}
                  disabled={isUpdating}
                >
                  Save Discount
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This discount will be applied to all orders for this user.
              </p>
            </div>
          </div>

          {orders.length > 0 && (
            <div className="mt-8 text-gray-900 dark:text-white">
              <h3 className="font-semibold text-xl mb-4">Orders:</h3>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Order Number</Table.HeadCell>
                  <Table.HeadCell>Price</Table.HeadCell>
                  <Table.HeadCell>Products number</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Total</Table.HeadCell>
                </Table.Head>

                <Table.Body className="divide-y">
                  {orders.map((order) => {
                    return (
                      <OrderWrapper
                        onClick={selectActiveOrder}
                        key={order.id}
                        order={order}
                      />
                    )
                  })}
                </Table.Body>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-between">
          <Button
            color="gray"
            disabled={isSendingReset}
            isProcessing={isSendingReset}
            onClick={sendPasswordReset}
          >
            Send password reset email
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {isOrderDetailsVisible && (
        <OrderDetails
          isOpen={isOrderDetailsVisible}
          onClose={() => setIsOrderDetailsVisible(false)}
          order={activeOrder}
        />
      )}
    </>
  )
}

export default UserDetails
