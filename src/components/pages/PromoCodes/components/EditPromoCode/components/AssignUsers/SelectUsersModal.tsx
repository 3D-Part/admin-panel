'use client'

import { Loader } from '@/components/common'
import { usePromoCodesSliceStore, useUsersSliceStore } from '@/store/store'
import {
  Button,
  Checkbox,
  Dropdown,
  Label,
  Modal,
  ToggleSwitch,
} from 'flowbite-react'
import React, { useEffect, useState } from 'react'

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

  const { activePromoCode } = usePromoCodesSliceStore()
  const { fetchAllUsers, allUsers } = useUsersSliceStore()

  const { Item } = Dropdown

  const handleInputChange = (e: {
    target: { checked: any; id: string; name: string }
  }) => {
    const { checked, id, name } = e.target

    // if (checked) {
    //   addActiveCategoryAttribute(id, name)
    // } else {
    //   removeActiveCategoryAttribute(id, name)
    // }
    console.log('test')
  }

  const getAllUsers = async () => {
    setLoading(true)
    await fetchAllUsers()
    setLoading(false)
  }

  useEffect(() => {
    getAllUsers()
  }, [])

  if (!isOpen) return <></>

  return (
    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>Assign users to promo code:</Modal.Header>
      <Modal.Body>
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

        {/* SELECTED USERS */}
        <div className="mb-2 flex gap-2">
          <Label htmlFor="users" value="Users" />
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

          <Dropdown dismissOnClick={false} label="Attributes">
            {allUsers.map((user) => {
              // const checked = activePromoCode.?.some(
              //   (initSelectedUser) => initSelectedUser.attribute.id === user.id
              // )

              return (
                <Item key={user.id}>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      name={user.fullName}
                      defaultChecked={false}
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
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => console.log('sd')}>Assign</Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>

      {loading && <Loader />}
    </Modal>
  )
}

export default SelectUsersModal
