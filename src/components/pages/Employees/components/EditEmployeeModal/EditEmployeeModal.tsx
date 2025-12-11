import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Modal, Button, Label, Spinner } from 'flowbite-react'
import { PermissionEnum, EditEmployeeData, User } from '@/shared/types'
import UsersAPI from '@/services/users'
import { toast } from 'react-toastify'

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

  const handlePermissionToggle = useCallback(
    (permission: PermissionEnum) => {
      setSelectedPermissions((prev) => {
        if (prev.includes(permission)) {
          // If removing a permission, also remove its dependent permission
          let newPermissions = prev.filter((p) => p !== permission)

          // If removing a WRITE permission, also remove the corresponding READ permission
          if (permission.endsWith('_WRITE')) {
            const correspondingRead = permission.replace(
              '_WRITE',
              '_READ'
            ) as PermissionEnum
            newPermissions = newPermissions.filter(
              (p) => p !== correspondingRead
            )
          }

          return newPermissions
        } else {
          // If adding a permission, also add its dependent permission
          let newPermissions = [...prev, permission]

          // If adding a WRITE permission, also add the corresponding READ permission
          if (permission.endsWith('_WRITE')) {
            const correspondingRead = permission.replace(
              '_WRITE',
              '_READ'
            ) as PermissionEnum
            if (!newPermissions.includes(correspondingRead)) {
              newPermissions.push(correspondingRead)
            }
          }

          return newPermissions
        }
      })

      // Clear permission error immediately
      if (errors.permissions) {
        setErrors((prev) => ({ ...prev, permissions: undefined }))
      }
    },
    [errors.permissions]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employee) {
      setErrors({ permissions: 'No employee data available.' })
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
        toast('Employee updated successfully!', {
          type: 'success',
          position: 'top-right',
          autoClose: 3000,
        })
        onSuccess()
        handleClose()
      } else {
        toast('Failed to update employee. Please try again.', {
          type: 'error',
          position: 'top-right',
          autoClose: 5000,
        })
        setErrors({
          permissions: 'Failed to update employee. Please try again.',
        })
      }
    } catch (error) {
      toast('An error occurred. Please try again.', {
        type: 'error',
        position: 'top-right',
        autoClose: 5000,
      })
      setErrors({ permissions: 'An error occurred. Please try again.' })
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

  const permissionGroups = [
    {
      title: 'Products',
      permissions: [PermissionEnum.PRODUCT_READ, PermissionEnum.PRODUCT_WRITE],
    },
    {
      title: 'Categories',
      permissions: [
        PermissionEnum.CATEGORY_READ,
        PermissionEnum.CATEGORY_WRITE,
      ],
    },
    {
      title: 'Manufacturers',
      permissions: [
        PermissionEnum.MANUFACTURER_READ,
        PermissionEnum.MANUFACTURER_WRITE,
      ],
    },
    {
      title: 'Attributes',
      permissions: [
        PermissionEnum.ATTRIBUTES_READ,
        PermissionEnum.ATTRIBUTES_WRITE,
      ],
    },
    {
      title: 'Orders',
      permissions: [PermissionEnum.ORDERS_READ, PermissionEnum.ORDERS_WRITE],
    },
    {
      title: 'Promo Codes',
      permissions: [
        PermissionEnum.PROMO_CODE_READ,
        PermissionEnum.PROMO_CODE_WRITE,
      ],
    },
    {
      title: 'Sales',
      permissions: [PermissionEnum.SALE_READ, PermissionEnum.SALE_WRITE],
    },
    {
      title: 'Users',
      permissions: [PermissionEnum.USER_READ],
    },
    {
      title: 'Employees',
      permissions: [
        PermissionEnum.EMPLOYEE_READ,
        PermissionEnum.EMPLOYEE_WRITE,
      ],
    },
  ]

  return (
    <Modal show={isOpen} onClose={handleClose} size="4xl">
      <Modal.Header className="dark:bg-gray-800 dark:text-white">
        Edit Employee
      </Modal.Header>
      <Modal.Body className="dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="email"
                value="Email"
                className="dark:text-gray-300"
              />
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@gmail.com"
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
                value="Full Name"
                className="dark:text-gray-300"
              />
              <input
                ref={fullNameInputRef}
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
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
            <Label value="Permissions" className="dark:text-gray-300" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select the permissions this employee should have:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {permissionGroups.map((group) => (
                <div
                  key={group.title}
                  className="border rounded-lg p-4 dark:border-gray-600 dark:bg-gray-700"
                >
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {group.title}
                  </h4>
                  <div className="space-y-2">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                          disabled={isLoading}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {permission
                            .replace('_', ' ')
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

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
              Cancel
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
                  Updating...
                </>
              ) : (
                'Update Employee'
              )}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default EditEmployeeModal
