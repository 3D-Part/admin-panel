"use client";

import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

type ModalType = {
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
  message?: string;
  isLoading?: boolean;
};

const WarningModal: React.FC<ModalType> = ({
  isOpen,
  onSave,
  onClose,
  isLoading = false,
  message = "Are you sure you want to delete?",
}) => {
  return (
    <>
      <Modal dismissible show={isOpen} size="lg" popup onClose={onClose}>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {message}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                isProcessing={isLoading}
                disabled={isLoading}
                color="failure"
                onClick={onSave}
              >
                <span>Yes, I am sure</span>
              </Button>
              <Button disabled={isLoading} color="gray" onClick={onClose}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default WarningModal;
