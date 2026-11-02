'use client'

import React, { useEffect, useRef, useState, SyntheticEvent } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { useShopSettingsStore } from '@/store/store'
import { toast } from 'react-toastify'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { useSearchParams } from 'next/navigation'
import PageImages, { PageImage } from './PageImages'
import BillingOptions from './BillingOptions'
import {
  BillingOption,
  readBillingOptions,
} from '@/shared/helpers/billingOptions'

// Each section is its own item in the sidebar, what it does is said up front
const TABS: Record<string, { title: string; help: string }> = {
  banner: {
    title: 'Top banner',
    help: 'The line of text at the very top of the site, for example a sale announcement. Leave it empty to hide it.',
  },
  'home-slider': {
    title: 'Home slider',
    help: 'The big images that slide on the home page. Add an image, upload it for desktop and for phones, and it joins the slider.',
  },
  'page-images': {
    title: 'Page images',
    help: 'One banner above the products of the page you choose: a category, all products, or every product page. Nothing here changes the home slider.',
  },
  'discount-tiers': {
    title: 'Discount tiers',
    help: 'How much each customer tier saves. On a product already on sale the customer gets the better of the two: a 10% sale with a 15% tier gives 15% in total, not 25%. The tier is set per customer in Users.',
  },
  'invoice-statuses': {
    title: 'Invoice statuses',
    help: 'The choices in the Invoice column of Orders: where the paperwork of an order stands. Customers never see them.',
  },
  delivery: {
    title: 'Delivery',
    help: 'What delivery costs the customer, and from which order value it is free.',
  },
  company: {
    title: 'Company details',
    help: 'Your contact details on the site and on proformas. The bank account is what customers pay a proforma to.',
  },
  'social-media': {
    title: 'Social media',
    help: 'The links in the footer of the site.',
  },
  tidio: {
    title: 'Tidio chat',
    help: 'Public key from Tidio → Settings → Developer. The chat shows on the site as soon as this is saved, and leaving it empty turns it off.',
  },
}

interface BannerSettings {
  text: string
}

interface DeliverySettings {
  cost: string
  freeDeliveryLimit: string
}

interface CompanyDetails {
  emails: string[]
  phone: string
  town: string
  address: string
  bankAccount: string
}

interface SocialMediaSettings {
  facebook: string
  instagram: string
  olx: string
}

interface SettingsFormData {
  banner: BannerSettings
  delivery: DeliverySettings
  company: CompanyDetails
  socialMedia: SocialMediaSettings
  tiers: { bronze: string; silver: string; gold: string }
  tidio: { key: string }
  pageImages: PageImage[]
  billingOptions: BillingOption[]
}

const GeneralSettings = () => {
  const requestedTab = useSearchParams().get('tab') ?? ''
  const tab = TABS[requestedTab] ? requestedTab : 'banner'
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
      emails: [''],
      phone: '',
      town: '',
      address: '',
      bankAccount: '',
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      olx: '',
    },
    tiers: { bronze: '', silver: '', gold: '' },
    tidio: { key: '' },
    pageImages: [],
    billingOptions: [],
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
            emails:
              settings.company?.emails?.length > 0
                ? settings.company.emails
                : [''],
            phone: settings.company?.phone || '',
            town: settings.company?.town || '',
            address: settings.company?.address || '',
            bankAccount: settings.company?.bankAccount || '',
          },
          socialMedia: {
            facebook: settings.socialMedia?.facebook || '',
            instagram: settings.socialMedia?.instagram || '',
            olx: settings.socialMedia?.olx || '',
          },
          tiers: {
            bronze: String(settings.tiers?.bronze ?? ''),
            silver: String(settings.tiers?.silver ?? ''),
            gold: String(settings.tiers?.gold ?? ''),
          },
          tidio: { key: settings.tidio?.key ?? '' },
          pageImages: settings.pageImages ?? [],
          billingOptions: readBillingOptions(settings),
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

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...formData.company.emails]
    newEmails[index] = value
    setFormData({
      ...formData,
      company: {
        ...formData.company,
        emails: newEmails,
      },
    })
  }

  const addEmailField = () => {
    setFormData({
      ...formData,
      company: {
        ...formData.company,
        emails: [...formData.company.emails, ''],
      },
    })
  }

  const removeEmailField = (index: number) => {
    if (formData.company.emails.length === 1) return
    const newEmails = formData.company.emails.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      company: {
        ...formData.company,
        emails: newEmails,
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
          emails: formData.company.emails.filter(
            (email) => email.trim() !== ''
          ),
          phone: formData.company.phone,
          town: formData.company.town,
          address: formData.company.address,
          bankAccount: formData.company.bankAccount.trim(),
        },
        socialMedia: {
          facebook: formData.socialMedia.facebook,
          instagram: formData.socialMedia.instagram,
          olx: formData.socialMedia.olx,
        },
        tiers: {
          bronze: parseFloat(formData.tiers.bronze) || 0,
          silver: parseFloat(formData.tiers.silver) || 0,
          gold: parseFloat(formData.tiers.gold) || 0,
        },
        tidio: { key: formData.tidio.key.trim() },
        pageImages: formData.pageImages.filter((image) => image.desktop),
        billingOptions: formData.billingOptions.filter((option) =>
          option.label.trim()
        ),
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
          {TABS[tab].title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
          {TABS[tab].help}
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4">
          {tab === 'banner' && (
          <div id="banner" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
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
          )}

          {tab === 'discount-tiers' && (
          <div id="discount-tiers" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {(['bronze', 'silver', 'gold'] as const).map((tier) => (
                <div key={tier}>
                  <Label htmlFor={`tier-${tier}`} value={`${tier[0].toUpperCase()}${tier.slice(1)} (%)`} />
                  <TextInput
                    id={`tier-${tier}`}
                    name={`tiers.${tier}`}
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tiers[tier]}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>
          </div>
          )}

          {(tab === 'home-slider' || tab === 'page-images') && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <PageImages
                scope={tab === 'home-slider' ? 'home' : 'pages'}
                value={formData.pageImages}
                onChange={(pageImages) => setFormData({ ...formData, pageImages })}
              />
            </div>
          )}

          {tab === 'invoice-statuses' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <BillingOptions
                value={formData.billingOptions}
                onChange={(billingOptions) =>
                  setFormData({ ...formData, billingOptions })
                }
              />
            </div>
          )}

          {tab === 'tidio' && (
          <div id="tidio" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <TextInput
              id="tidioKey"
              name="tidio.key"
              value={formData.tidio.key}
              onChange={handleInputChange}
            />
          </div>
          )}

          {tab === 'delivery' && (
          <div id="delivery" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
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
          )}

          {tab === 'company' && (
          <div id="company" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Emails */}
              <div className="w-full sm:col-span-2">
                <div className="mb-2 flex">
                  <Label
                    className="text-base"
                    htmlFor="companyEmail"
                    value="Email(s)"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Company contact emails
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.company.emails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <TextInput
                        onChange={(e) =>
                          handleEmailChange(index, e.target.value)
                        }
                        id={`companyEmail-${index}`}
                        type="email"
                        value={email}
                        placeholder="contact@company.com"
                        className="flex-1"
                      />
                      {formData.company.emails.length > 1 && (
                        <Button
                          type="button"
                          color="red"
                          size="sm"
                          onClick={() => removeEmailField(index)}
                        >
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  color="light"
                  size="sm"
                  onClick={addEmailField}
                  className="mt-2"
                >
                  <HiPlus className="h-4 w-4 mr-1" />
                  Add Email
                </Button>
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

              {/* Bank account */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyBankAccount"
                    value="Bank account"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Printed and emailed on proformas
                  </p>
                </div>
                <TextInput
                  name="company.bankAccount"
                  onChange={handleInputChange}
                  id="companyBankAccount"
                  type="text"
                  value={formData.company.bankAccount}
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
          )}

          {tab === 'social-media' && (
          <div id="social-media" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Facebook */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="socialMediaFacebook"
                    value="Facebook"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Facebook page URL
                  </p>
                </div>
                <TextInput
                  name="socialMedia.facebook"
                  onChange={handleInputChange}
                  id="socialMediaFacebook"
                  type="url"
                  value={formData.socialMedia.facebook}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              {/* Instagram */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="socialMediaInstagram"
                    value="Instagram"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Instagram profile URL
                  </p>
                </div>
                <TextInput
                  name="socialMedia.instagram"
                  onChange={handleInputChange}
                  id="socialMediaInstagram"
                  type="url"
                  value={formData.socialMedia.instagram}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>

              {/* OLX */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="socialMediaOlx"
                    value="OLX"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    OLX store URL
                  </p>
                </div>
                <TextInput
                  name="socialMedia.olx"
                  onChange={handleInputChange}
                  id="socialMediaOlx"
                  type="url"
                  value={formData.socialMedia.olx}
                  placeholder="https://olx.ba/korisnik/yourstore"
                />
              </div>
            </div>
          </div>
          )}

        </div>

        {/* Fixed Save Button */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex justify-end">
            <Button
              type="submit"
              isProcessing={loading}
              disabled={loading}
              size="md"
              color="purple"
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
