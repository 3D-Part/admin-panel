import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Modal, Button, Label, Spinner } from 'flowbite-react'
import { PermissionEnum, EditEmployeeData, User } from '@/shared/types'
import UsersAPI from '@/services/users'
import { toast } from 'react-toastify'
import PermissionPicker from '../PermissionPicker'

interface EditEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  employee: User | null
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<
    PermissionEnum[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    fullName?: string
    permissions?: string
  }>({})

  // Refs for input values - no re-renders on typing
  const emailInputRef = useRef<HTMLInputElement>(null)
  const fullNameInputRef = useRef<HTMLInputElement>(null)

  // Pre-fill form data when employee changes
  useEffect(() => {
    if (employee && isOpen) {
      // Set input values
      if (emailInputRef.current) {
        emailInputRef.current.value = employee.email
      }
      if (fullNameInputRef.current) {
        fullNameInputRef.current.value = employee.fullName
      }

      // Set permissions from employee data
      const employeePermissions = employee.permissions.map((p) => p.permission)
      setSelectedPermissions(employeePermissions)

      // Clear errors
      setErrors({})
    }
  }, [employee, isOpen])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employee) {
      setErrors({ permissions: tx("No employee data available.") })
      return
    }

    // Get values from refs
    const email = emailInputRef.current?.value || ''
    const fullName = fullNameInputRef.current?.value || ''

    // Reset errors
    setErrors({})

    // Validate form
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!fullName) {
      newErrors.fullName = 'Full name is required'
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = 'Please select at least one permission'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const employeeData: EditEmployeeData = {
        email,
        fullName,
        permissions: selectedPermissions,
      }

      const success = await UsersAPI.editEmployee(employee.id, employeeData)

      if (success) {
        toast(tx("Employee updated successfully!"), {
          type: 'success',
          position: 'top-right',
          autoClose: 3000,
        })
        onSuccess()
        handleClose()
      } else {
        toast(tx("Failed to update employee. Please try again."), {
          type: 'error',
          position: 'top-right',
          autoClose: 5000,
        })
        setErrors({
          permissions: tx("Failed to update employee. Please try again."),
        })
      }
    } catch (error) {
      toast(tx("An error occurred. Please try again."), {
        type: 'error',
        position: 'top-right',
        autoClose: 5000,
      })
      setErrors({ permissions: tx("An error occurred. Please try again.") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = useCallback(() => {
    setSelectedPermissions([])
    setErrors({})
    setIsLoading(false)
    onClose()
  }, [onClose])


  return (
    <Modal root={modalRoot()} show={isOpen} onClose={handleClose} size="4xl">
      <Modal.Header className="dark:bg-gray-800 dark:text-white">
        {tx("Edit Employee")}
      </Modal.Header>
      <Modal.Body className="dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="email"
                value={tx("Email")}
                className="dark:text-gray-300"
              />
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                placeholder={tx("johndoe@gmail.com")}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="fullName"
                value={tx("Full Name")}
                className="dark:text-gray-300"
              />
              <input
                ref={fullNameInputRef}
                id="fullName"
                name="fullName"
                type="text"
                placeholder={tx("John Doe")}
                disabled={isLoading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${
                  errors.fullName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <Label value={tx("Permissions")} className="dark:text-gray-300" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {tx("Pick for each section what this employee can do:")}
            </p>

            <PermissionPicker
              value={selectedPermissions}
              disabled={isLoading}
              onChange={(next) => {
                setSelectedPermissions(next)
                if (errors.permissions) {
                  setErrors((prev) => ({ ...prev, permissions: undefined }))
                }
              }}
            />

            {errors.permissions && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                {errors.permissions}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              color="gray"
              onClick={handleClose}
              disabled={isLoading}
              className="dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white"
            >
              {tx("Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              color="purple"
              className="dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {tx("Updating...")}
                </>
              ) : (
                tx("Update Employee")
              )}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditEmployeeModal
