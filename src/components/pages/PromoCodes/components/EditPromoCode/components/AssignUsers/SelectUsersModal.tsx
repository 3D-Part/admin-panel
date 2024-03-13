'use client'

import { Button, Modal } from 'flowbite-react'
import React from 'react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

type SelectUsersModalType = {
  isOpen: boolean
  onClose: () => void
}

const SelectUsersModal: React.FC<SelectUsersModalType> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return <></>

  return (
    // <Modal dismissible show={isOpen} size="lg" popup onClose={onClose}>
    //   <Modal.Header>Terms of Service</Modal.Header>
    //   <Modal.Body>
    //     <div className="text-center">
    //       <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
    //       <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
    //         Title
    //       </h3>
    //       <div className="flex justify-center gap-4">
    //         <Button
    //           // isProcessing={isLoading}
    //           // disabled={isLoading}
    //           color="failure"
    //           // onClick={onSave}
    //         >
    //           <span>Yes, I am sure</span>
    //         </Button>
    //         <Button
    //           // disabled={isLoading}
    //           color="gray"
    //           onClick={onClose}
    //         >
    //           No, cancel
    //         </Button>
    //       </div>
    //     </div>
    //   </Modal.Body>
    // </Modal>

    <Modal show={isOpen} onClose={onClose}>
      <Modal.Header>Assign users to promo code:</Modal.Header>
      <Modal.Body>
        <div className="space-y-6"></div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => console.log('sd')}>Assign</Button>
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SelectUsersModal
