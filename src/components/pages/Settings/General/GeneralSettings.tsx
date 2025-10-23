'use client'

import React, { useEffect, useRef, useState, SyntheticEvent } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { useShopSettingsStore } from '@/store/store'
import { toast } from 'react-toastify'

interface BannerSettings {
  text: string
}

interface DeliverySettings {
  cost: string
  freeDeliveryLimit: string
}

interface CompanyDetails {
  email: string
  phone: string
  town: string
  address: string
}

interface SettingsFormData {
  banner: BannerSettings
  delivery: DeliverySettings
  company: CompanyDetails
}

const GeneralSettings = () => {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<SettingsFormData>({
    banner: {
      text: '',
    },
    delivery: {
      cost: '',
      freeDeliveryLimit: '',
    },
    company: {
      email: '',
      phone: '',
      town: '',
      address: '',
    },
  })
  const formRef = useRef<HTMLFormElement>(null)

  const { getShopSettings, updateShopSettings } = useShopSettingsStore()

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setInitialLoading(true)
      const data = await getShopSettings()

      if (data?.settings) {
        const settings = data.settings as any

        // Populate form with existing settings
        setFormData({
          banner: {
            text: settings.banner?.text || '',
          },
          delivery: {
            cost: settings.delivery?.cost?.toString() || '',
            freeDeliveryLimit:
              settings.delivery?.freeDeliveryLimit?.toString() || '',
          },
          company: {
            email: settings.company?.email || '',
            phone: settings.company?.phone || '',
            town: settings.company?.town || '',
            address: settings.company?.address || '',
          },
        })
      }

      setInitialLoading(false)
    }

    fetchSettings()
  }, [getShopSettings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const [section, field] = name.split('.')

    setFormData({
      ...formData,
      [section]: {
        ...(formData as any)[section],
        [field]: value,
      },
    })
  }

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const success = await updateShopSettings({
      settings: {
        banner: {
          text: formData.banner.text,
        },
        delivery: {
          cost: parseFloat(formData.delivery.cost) || 0,
          freeDeliveryLimit:
            parseFloat(formData.delivery.freeDeliveryLimit) || 0,
        },
        company: {
          email: formData.company.email,
          phone: formData.company.phone,
          town: formData.company.town,
          address: formData.company.address,
        },
      },
    })

    if (success) {
      toast('Settings updated successfully!', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    } else {
      toast('Failed to update settings', {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
    }

    setLoading(false)
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">
          Loading settings...
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          General Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your shop configuration and preferences
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {/* Banner Settings Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Banner Settings
            </h3>
            <div className="space-y-4">
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="bannerText"
                    value="Banner Text"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Text to display at the top of your storefront
                  </p>
                </div>
                <TextInput
                  name="banner.text"
                  onChange={handleInputChange}
                  id="bannerText"
                  type="text"
                  value={formData.banner.text}
                  placeholder="BLACK FRIDAY: 20% popusta na sve proizvode!"
                />
              </div>
            </div>
          </div>

          {/* Delivery Settings Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delivery Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery Cost */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="deliveryCost"
                    value="Delivery Cost"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Standard delivery charge
                  </p>
                </div>
                <TextInput
                  name="delivery.cost"
                  onChange={handleInputChange}
                  id="deliveryCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery.cost}
                  placeholder="0.00"
                />
              </div>

              {/* Free Delivery Limit */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="freeDeliveryLimit"
                    value="Free Delivery Threshold"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Minimum order value for free delivery
                  </p>
                </div>
                <TextInput
                  name="delivery.freeDeliveryLimit"
                  onChange={handleInputChange}
                  id="freeDeliveryLimit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.delivery.freeDeliveryLimit}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Email */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyEmail"
                    value="Email"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Company contact email
                  </p>
                </div>
                <TextInput
                  name="company.email"
                  onChange={handleInputChange}
                  id="companyEmail"
                  type="email"
                  value={formData.company.email}
                  placeholder="contact@company.com"
                />
              </div>

              {/* Company Phone */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyPhone"
                    value="Phone Number"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Company contact phone
                  </p>
                </div>
                <TextInput
                  name="company.phone"
                  onChange={handleInputChange}
                  id="companyPhone"
                  type="tel"
                  value={formData.company.phone}
                  placeholder="+387 XX XXX XXX"
                />
              </div>

              {/* Company Town */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyTown"
                    value="Town/City"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Company location
                  </p>
                </div>
                <TextInput
                  name="company.town"
                  onChange={handleInputChange}
                  id="companyTown"
                  type="text"
                  value={formData.company.town}
                  placeholder="Banja Luka"
                />
              </div>

              {/* Company Address */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyAddress"
                    value="Address"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Company street address
                  </p>
                </div>
                <TextInput
                  name="company.address"
                  onChange={handleInputChange}
                  id="companyAddress"
                  type="text"
                  value={formData.company.address}
                  placeholder="Street Name 123"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex justify-end">
            <Button
              type="submit"
              isProcessing={loading}
              disabled={loading}
              size="md"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default GeneralSettings
