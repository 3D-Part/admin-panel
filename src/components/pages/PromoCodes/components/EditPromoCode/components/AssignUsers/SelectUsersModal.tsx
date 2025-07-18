'use client'

import { Loader } from '@/components/common'
import PromoCodesAPI from '@/services/promoCodes'
import { URLPartsEnum } from '@/shared/enums'
import { PromoCodeUsers, UsersToPromoCode } from '@/shared/types'
import { usePromoCodesSliceStore, useUsersSliceStore } from '@/store/store'
import {
  Button,
  Checkbox,
  Dropdown,
  Label,
  Modal,
  ToggleSwitch,
} from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

type SelectUsersModalType = {
  isOpen: boolean
  onClose: () => void
}

const SelectUsersModal: React.FC<SelectUsersModalType> = ({
  isOpen,
  onClose,
}) => {
  const [applyToAll, setApplyToAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialUsers, setInitialUsers] = useState<PromoCodeUsers[]>([])

  const { activePromoCode } = usePromoCodesSliceStore()

  const router = useRouter()

  const activeUsersRef = useRef<string[]>([])

  const { addUsersToPromoCode } = PromoCodesAPI

  const { id: promoCodeId } = activePromoCode

  const { fetchAllUsers, allUsers } = useUsersSliceStore()

  const { Item } = Dropdown

  const addUserToPromoCode = (id: string) => {
    activeUsersRef.current.push(id)
  }

  const removeUserFromPromoCode = (id: string) => {
    const userIndex = activeUsersRef.current.findIndex(
      (userId) => userId === id
    )

    if (userIndex !== -1) {
      const updatedAttributes = activeUsersRef.current.filter(
        (userId) => userId !== id
      )
      activeUsersRef.current = updatedAttributes
    }
  }

  const handleInputChange = (e: {
    target: { checked: any; id: string; name: string }
  }) => {
    setApplyToAll(false)

    const { checked, id } = e.target

    if (checked) {
      addUserToPromoCode(id)
    } else {
      removeUserFromPromoCode(id)
    }
  }

  const getAllUsers = async () => {
    setLoading(true)
    await fetchAllUsers()
    setLoading(false)
  }

  const assignUser = async () => {
    let data: UsersToPromoCode = {} as UsersToPromoCode

    if (applyToAll) {
      data = {
        userIds: [],
        promoCodeId: promoCodeId,
        applyToAllUsers: true,
      }
    } else {
      data = {
        userIds: activeUsersRef.current,
        promoCodeId: promoCodeId,
        applyToAllUsers: false,
      }
    }

    setLoading(true)
    const responseData = await addUsersToPromoCode(data)
    setLoading(false)
    if (responseData) {
      toast('Users added to promo code', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    }
    onClose()
  }

  const setInitialUsersData = () => {
    if (!activePromoCode.userPromotionCode) return

    if (activePromoCode.userPromotionCode?.length === allUsers.length) {
      setApplyToAll(true)
    } else {
      const filderUsersIds = activePromoCode.userPromotionCode.map(
        (user) => user.userId
      )

      activeUsersRef.current = filderUsersIds
      setInitialUsers(activePromoCode.userPromotionCode)
    }
  }

  useEffect(() => {
    if (!activePromoCode.id) {
      router.push(URLPartsEnum.PromoCodes)
      // rediredt to pormo code
    }
  }, [activePromoCode])

  useEffect(() => {
    setInitialUsersData()
  }, [allUsers])

  useEffect(() => {
    getAllUsers()
  }, [])

  if (!isOpen) return <></>

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>Assign users to promo code:</Modal.Header>
      <Modal.Body className="flex flex-col gap-6">
        {/* SELECTED USERS */}
        <div className="mb-2 flex items-center gap-2">
          <Label className="text-base" htmlFor="users" value="Select Users: " />
          {/* {allUsers.length > 0 && (
            <div className="text-sm font-medium text-gray-900 dark:text-gray-300 flex flex-wrap gap-1">
              (
              {allUsers.map((user, index) => {
                return (
                  <span key={user.id}>
                    {index > 0 ? ',' : ''} {user.fullName}
                  </span>
                )
              })}
              )
            </div>
          )} */}

          <Dropdown
            className="h-auto max-h-[400px] overflow-y-auto"
            dismissOnClick={false}
            label="Users"
          >
            {allUsers.map((user) => {
              const checked = initialUsers?.some(
                (initSelectedUser) => initSelectedUser.userId === user.id
              )

              return (
                <Item key={user.id}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      name={user.fullName}
                      defaultChecked={checked}
                      onChange={handleInputChange}
                      id={user.id}
                    />
                    <Label htmlFor="at1">{user.fullName}</Label>
                  </div>
                </Item>
              )
            })}
          </Dropdown>
        </div>

        {/* ALL */}
        <div className="flex items-center gap-4 text-gray-900 dark:text-gray-300">
          <p className="m-0">Apply to all users:</p>
          <ToggleSwitch
            className=""
            color="blue"
            checked={applyToAll}
            type="button"
            onChange={() => setApplyToAll(!applyToAll)}
            label=""
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button isProcessing={loading} disabled={loading} onClick={assignUser}>
          Assign
        </Button>
        <Button
          isProcessing={loading}
          disabled={loading}
          color="gray"
          onClick={onClose}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SelectUsersModal
