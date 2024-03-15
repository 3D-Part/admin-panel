'use client'

import { User } from '@/shared/types'
import { Button, Modal } from 'flowbite-react'
import React, { useEffect } from 'react'

type UserDetailType = {
  name: string
  vertical?: boolean
  value: string | null
}

const OrderDetail: React.FC<UserDetailType> = ({ value, name, vertical }) => {
  return (
    <div
      className={`flex justify-between  gap-4 flex-1 basis-[48%] rounded-lg bg-slate-600 text-white p-3 ${
        vertical ? 'flex-col items-start' : 'items-center'
      }`}
    >
      <p className="font-semibold">{name}</p>
      <span className="text-gray-300">{value ? value : '-'}</span>
    </div>
  )
}

type UserDetailsType = {
  user: User
  isOpen: boolean
  onClose: () => void
}

const UserDetails: React.FC<UserDetailsType> = ({ user, isOpen, onClose }) => {
  const {
    id,
    fullName,
    email,
    password,
    role,
    provider,
    phone,
    state,
    city,
    postCode,
    street,
    orders,
  } = user

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header>
        User ID: <span className="text-gray-400">#{id}</span>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-wrap gap-4">
          <OrderDetail name="Full name:" value={fullName} />
          <OrderDetail name="Email:" value={email} />
          {/* <OrderDetail name="Password:" value={password} /> */}
          <OrderDetail name="Phone:" value={phone} />
          <OrderDetail name="State:" value={state} />
          <OrderDetail name="City:" value={city} />
          <OrderDetail name="Street:" value={street} />
          <OrderDetail name="PostCode:" value={postCode} />
          <OrderDetail name="Role:" value={role} />
          <OrderDetail name="Provider:" value={provider} />

          {/* <OrderDetail
            name="Description:"
            vertical={true}
            value={description}
          /> */}
        </div>

        {/* <div className="mt-8 text-white">
          <h3 className="font-semibold text-xl mb-4">Products:</h3>
          <Table>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Sku</Table.HeadCell>
              <Table.HeadCell>Total</Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y">
              {products.map((product) => {
                return <ProductWrapper key={product.id} product={product} />
              })}
            </Table.Body>
          </Table>
        </div> */}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UserDetails
