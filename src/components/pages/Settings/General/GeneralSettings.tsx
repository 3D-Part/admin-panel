'use client'

import React, { useEffect, useRef, useState, SyntheticEvent } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { useShopSettingsStore } from '@/store/store'
import { toast } from 'react-toastify'

interface SettingsFormData {
  bannerText: string
  deliveryCost: string
  freeDeliveryLimit: string
}

const GeneralSettings = () => {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<SettingsFormData>({
    bannerText: '',
    deliveryCost: '',
    freeDeliveryLimit: '',
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
          bannerText: settings.bannerText || '',
          deliveryCost: settings.deliveryCost?.toString() || '',
          freeDeliveryLimit: settings.freeDeliveryLimit?.toString() || '',
        })
      }

      setInitialLoading(false)
    }

    fetchSettings()
  }, [getShopSettings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const onSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const success = await updateShopSettings({
      settings: {
        bannerText: formData.bannerText,
        deliveryCost: parseFloat(formData.deliveryCost) || 0,
        freeDeliveryLimit: parseFloat(formData.freeDeliveryLimit) || 0,
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6 pb-8">
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
                  name="bannerText"
                  onChange={handleInputChange}
                  id="bannerText"
                  type="text"
                  value={formData.bannerText}
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
                  name="deliveryCost"
                  onChange={handleInputChange}
                  id="deliveryCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryCost}
                  placeholder="0.00"
                  required
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
                  name="freeDeliveryLimit"
                  onChange={handleInputChange}
                  id="freeDeliveryLimit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.freeDeliveryLimit}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
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
        </form>
      </div>
    </div>
  )
}

export default GeneralSettings
