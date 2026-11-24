'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useRef, useState, SyntheticEvent } from 'react'
import { Button, Label, Radio, Select, TextInput } from 'flowbite-react'
import { useShopSettingsStore } from '@/store/store'
import { toast } from 'react-toastify'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { useSearchParams } from 'next/navigation'
import PageImages, { PageImage } from './PageImages'
import HomeTilesSettings, { HomeTile, DEFAULT_HOME_TILES, homeTilesProblem, readHomeTiles } from './HomeTilesSettings'
import BillingOptions from './BillingOptions'
import RibbonsSettings from './RibbonsSettings'
import AvatarsSettings, { customerAvatarsProblem } from './AvatarsSettings'
import { CustomerAvatar, loadCustomerAvatars, readCustomerAvatars } from '@/shared/helpers/avatars'
import { ProductRibbon, productRibbonsProblem, readProductRibbons } from '@/shared/helpers/productIcons'
import BadgeLibrary, { BadgeImage } from './BadgeLibrary'
import CustomerFlagsSettings, { customerFlagsProblem } from './CustomerFlagsSettings'
import ZohoCampaignsSettings, {
  DEFAULT_ZOHO_FORM,
  ZohoForm,
  readZohoForm,
  zohoSettings,
} from './ZohoCampaignsSettings'
import NewsletterMailboxSettings, {
  DEFAULT_MAILBOX_FORM,
  MailboxForm,
  mailboxSettings,
  readMailboxForm,
} from './NewsletterMailboxSettings'
import {
  CustomerFlagType,
  readCustomerFlags,
  readOrderFlags,
  readProductFlags,
} from '@/shared/helpers/customerFlags'
import AssistantSettings, { AssistantForm, DEFAULT_ASSISTANT_FORM, assistantSettings, readAssistantForm } from './AssistantSettings'
import { BadgeItem, TIER_COLORS, TierRow, badgeProblem, newTierId, readTierRows, tierSettings } from '@/shared/helpers/tiers'
import {
  BillingOption,
  readBillingOptions,
  readOfferOptions,
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
  'home-tiles': {
    title: 'Home tiles',
    help: 'The two tiles under the slider on the home page, 3D filamenti and 3D printeri out of the box: picture, title, text, button and link of each. Without an uploaded picture a tile keeps the site\'s own.',
  },
  'page-images': {
    title: 'Page images',
    help: 'One banner above the products of the page you choose: a category, all products, or every product page. Nothing here changes the home slider.',
  },
  'discount-tiers': {
    title: 'Discount tiers',
    help: 'How much each customer tier saves, and how much a customer has to spend to reach it. On a product already on sale the customer gets the better of the two: a 10% sale with a 15% tier gives 15% in total, not 25%. A tier set by hand in Users stays, spending can only raise it.',
  },
  'invoice-statuses': {
    title: 'Invoice statuses',
    help: 'The checkboxes in the Invoice column: one list for orders, one for offers. Each ticked step fills its circle in the Status column with its color. A step can change the order status; the status always follows the rightmost ticked step that changes it, with its emails, points and stock. This is the only place statuses come from.',
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
  'customer-flags': {
    title: 'Customer statuses',
    help: 'The flags the staff put on a customer: they show next to the customer on every order, offer and in the users. A customer without one is neutral and shows nothing. Every red status means disputed: those customers are listed as disputed and their new orders are marked. Renaming or recoloring a status changes it on every customer who has it.',
  },
  'zoho-campaigns': {
    title: 'Zoho Campaigns',
    help: 'Newsletters are written on Subscribers → New campaign and sent through Zoho Campaigns to the newsletter list. Connect Zoho once here; new subscribers of the site go onto the list by themselves.',
  },
  'newsletter-mail': {
    title: 'Newsletter mailbox',
    help: 'The mailbox the newsletter is sent from. On Subscribers → Create drafts the newsletter goes straight into its Drafts folder, one draft per group of recipients in Bcc; you open the drafts in the mail program and send them. The shop never sends the newsletter itself.',
  },
  'product-flags': {
    title: 'Product flags',
    help: 'Flags the staff put on products, e.g. check the price or order more. They show next to the product in the products list, are picked there or on the product page, and the products list can be filtered by them. The site never shows them. Renaming or recoloring a flag changes it on every product that has it.',
  },
  ribbons: {
    title: 'Ribbons',
    help: 'The ribbons the shop puts on products, e.g. New, Best seller or Sale: name, color and icon. Tick them on a product under Stock & extras; the site shows on the product card the product\'s ribbon that is highest in this list, and all of them on the product page. Changing a ribbon here changes it on every product that has it.',
  },
  avatars: {
    title: 'Avatars',
    help: 'The pictures customers pick for their profile on the site. Upload your own, rename them, choose which ones customers can pick, or remove them. An avatar that is not offered any more stays with the customers who have it; a removed one is taken off them and they show their initials. In Users the staff can give a customer any of these.',
  },
  'order-flags': {
    title: 'Order flags',
    help: 'The flags the staff put on an order, e.g. urgent or waiting for payment. They show next to the order in the orders and offers lists and are picked in the order details. Renaming or recoloring a flag changes it on every order that has it.',
  },
  assistant: {
    title: 'Chat assistant',
    help: 'An AI shop assistant on the site, on ChatGPT (OpenAI) or Claude (Anthropic). It answers only about 3D printing and the products of the shop, finds products in the catalogue and sends customers to the support when it cannot help. To save tokens, the fixed instructions are cached by the AI, the same first question is answered from the server\'s memory for two hours, product searches are remembered for ten minutes, and the conversation sent is kept short.',
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
  tierList: TierRow[]
  badgeLibrary: BadgeItem[]
  tierPeriod: 'all' | '12m'
  tidio: { key: string }
  assistant: AssistantForm
  customerFlags: CustomerFlagType[]
  orderFlags: CustomerFlagType[]
  productFlags: CustomerFlagType[]
  productRibbons: ProductRibbon[]
  customerAvatars: CustomerAvatar[]
  newsletterMailbox: MailboxForm
  zohoCampaigns: ZohoForm
  pageImages: PageImage[]
  homeTiles: HomeTile[]
  billingOptions: BillingOption[]
  offerOptions: BillingOption[]
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
    tierList: [],
    badgeLibrary: [],
    tierPeriod: 'all',
    tidio: { key: '' },
    assistant: DEFAULT_ASSISTANT_FORM,
    customerFlags: [],
    orderFlags: [],
    productFlags: [],
    productRibbons: [],
    customerAvatars: [],
    newsletterMailbox: DEFAULT_MAILBOX_FORM,
    zohoCampaigns: DEFAULT_ZOHO_FORM,
    pageImages: [],
    homeTiles: DEFAULT_HOME_TILES,
    billingOptions: [],
    offerOptions: [],
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
          tierList: readTierRows(settings),
          badgeLibrary: Array.isArray(settings.badgeLibrary) ? settings.badgeLibrary : [],
          tierPeriod: settings.tierPeriod === '12m' ? '12m' : 'all',
          tidio: { key: settings.tidio?.key ?? '' },
          assistant: readAssistantForm(settings.assistant),
          customerFlags: readCustomerFlags(settings),
          orderFlags: readOrderFlags(settings),
          productFlags: readProductFlags(settings),
          productRibbons: readProductRibbons(settings),
          customerAvatars: readCustomerAvatars(settings),
          newsletterMailbox: readMailboxForm(settings.newsletterMailbox),
          zohoCampaigns: readZohoForm(settings.zohoCampaigns),
          pageImages: settings.pageImages ?? [],
          homeTiles: readHomeTiles(settings),
          billingOptions: readBillingOptions(settings),
          offerOptions: readOfferOptions(settings),
        })
      }

      setInitialLoading(false)
    }

    fetchSettings()
  }, [getShopSettings])

  const updateTier = (index: number, patch: Partial<TierRow>) =>
    setFormData((prev) => ({
      ...prev,
      tierList: prev.tierList.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    }))
  const addTier = () =>
    setFormData((prev) => {
      const name = `${tx("Tier")} ${prev.tierList.length + 1}`
      return {
        ...prev,
        tierList: [
          ...prev.tierList,
          { id: newTierId(name, prev.tierList.map((tier) => tier.id)), name, discount: '', threshold: '', color: 'blue', badge: '' },
        ],
      }
    })
  const removeTier = (index: number) =>
    setFormData((prev) => ({ ...prev, tierList: prev.tierList.filter((_, i) => i !== index) }))

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

    const names = formData.tierList.map((tier) => tier.name.trim().toLowerCase())
    const badTier = formData.tierList.find(
      (tier, i) =>
        !tier.name.trim() ||
        names.indexOf(tier.name.trim().toLowerCase()) !== i ||
        !(parseFloat(tier.discount) >= 0 && parseFloat(tier.discount) <= 100)
    )
    const badBadge = formData.badgeLibrary.find((badge) => !badge.name.trim() || badgeProblem(badge.svg))
    if (badBadge) {
      toast(`${badBadge.name || tx("Badge")}: ${tx(badgeProblem(badBadge.svg) ?? "Every badge needs a name.")}`, { type: 'error', autoClose: 5000 })
      return
    }
    const flagProblem =
      customerFlagsProblem(formData.customerFlags) ??
      customerFlagsProblem(formData.orderFlags, 'order') ??
      customerFlagsProblem(formData.productFlags, 'product')
    if (flagProblem) {
      toast(tx(flagProblem), { type: 'error', autoClose: 3500 })
      return
    }
    const ribbonProblem = productRibbonsProblem(formData.productRibbons)
    if (ribbonProblem) {
      toast(tx(ribbonProblem), { type: 'error', autoClose: 3500 })
      return
    }
    const avatarProblem = customerAvatarsProblem(formData.customerAvatars)
    if (avatarProblem) {
      toast(tx(avatarProblem), { type: 'error', autoClose: 3500 })
      return
    }
    const tileProblem = homeTilesProblem(formData.homeTiles)
    if (tileProblem) {
      toast(tx(tileProblem), { type: 'error', autoClose: 3500 })
      return
    }
    if (badTier) {
      toast(tx("Every tier needs its own name and a discount between 0 and 100."), {
        type: 'error',
        autoClose: 3500,
      })
      return
    }

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
        ...tierSettings(formData.tierList),
        badgeLibrary: formData.badgeLibrary,
        tierPeriod: formData.tierPeriod,
        tidio: { key: formData.tidio.key.trim() },
        // a key is sent only when a new one is typed; the API keeps the saved one otherwise
        assistant: assistantSettings(formData.assistant),
        customerFlags: formData.customerFlags.map((flag) => ({ ...flag, label: flag.label.trim() })),
        orderFlags: formData.orderFlags.map((flag) => ({ ...flag, label: flag.label.trim() })),
        productFlags: formData.productFlags.map((flag) => ({ ...flag, label: flag.label.trim() })),
        productRibbons: formData.productRibbons.map((ribbon) => ({ ...ribbon, label: ribbon.label.trim() })),
        customerAvatars: formData.customerAvatars.map((avatar) => ({ ...avatar, name: avatar.name.trim() })),
        newsletterMailbox: mailboxSettings(formData.newsletterMailbox),
        zohoCampaigns: zohoSettings(formData.zohoCampaigns),
        pageImages: formData.pageImages.filter((image) => image.desktop),
        homeTiles: formData.homeTiles.map((tile) => ({
          ...tile,
          title: tile.title.trim(),
          text: tile.text.trim(),
          buttonLabel: tile.buttonLabel.trim(),
          link: tile.link.trim(),
        })),
        billingOptions: formData.billingOptions.filter((option) =>
          option.label.trim()
        ),
        offerOptions: formData.offerOptions.filter((option) =>
          option.label.trim()
        ),
      },
    })

    if (success) {
      // the avatars shown across the admin follow the new list
      loadCustomerAvatars(true)
      toast(tx("Settings updated successfully!"), {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'success',
      })
    } else {
      toast(tx("Failed to update settings"), {
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
          {tx("Loading settings...")}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {tx(TABS[tab].title)}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
          {tx(TABS[tab].help)}
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="flex flex-col"
      >
        {/* Content */}
        <div className="space-y-6 pb-4">
          {tab === 'banner' && (
          <div id="banner" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="space-y-4">
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="bannerText"
                    value={tx("Banner Text")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Text to display at the top of your storefront")}
                  </p>
                </div>
                <TextInput
                  name="banner.text"
                  onChange={handleInputChange}
                  id="bannerText"
                  type="text"
                  value={formData.banner.text}
                  placeholder={tx("BLACK FRIDAY: 20% popusta na sve proizvode!")}
                />
              </div>
            </div>
          </div>
          )}

          {tab === 'discount-tiers' && (
          <div id="discount-tiers" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              {tx("Add as many tiers as you need. A bigger discount makes a higher tier. A customer who spends the amount in \"From\" gets the tier by themselves; leave it empty and the tier is only given by hand in Users. New, offered, cancelled and returned orders do not count.")}
            </p>
            <div className="space-y-3">
              {formData.tierList.map((tier, index) => (
                <div key={tier.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="grid items-end gap-3 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
                  <div>
                    <Label htmlFor={`tier-name-${tier.id}`} value={tx("Name")} />
                    <TextInput
                      id={`tier-name-${tier.id}`}
                      value={tier.name}
                      maxLength={30}
                      onChange={(e) => updateTier(index, { name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tier-discount-${tier.id}`} value={tx("Discount (%)")} />
                    <TextInput
                      id={`tier-discount-${tier.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={tier.discount}
                      onChange={(e) => updateTier(index, { discount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tier-threshold-${tier.id}`} value={tx("From (KM)")} />
                    <TextInput
                      id={`tier-threshold-${tier.id}`}
                      type="number"
                      min="0"
                      placeholder={tx("By hand only")}
                      value={tier.threshold}
                      onChange={(e) => updateTier(index, { threshold: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tier-color-${tier.id}`} value={tx("Badge colour")} />
                    <div className="flex items-center gap-2">
                      <span className={`h-5 w-5 shrink-0 rounded-full ${TIER_COLORS[tier.color].dot}`} />
                      <Select
                        id={`tier-color-${tier.id}`}
                        className="min-w-0 flex-1"
                        value={tier.color}
                        onChange={(e) => updateTier(index, { color: e.target.value })}
                      >
                        {Object.entries(TIER_COLORS).map(([key, color]) => (
                          <option key={key} value={key}>
                            {tx(color.label)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <Button
                    color="gray"
                    size="sm"
                    aria-label={tx("Remove tier")}
                    title={tx("Remove tier")}
                    onClick={() => removeTier(index)}
                  >
                    <HiTrash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3">
                  <Label value={tx("Badge")} />
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateTier(index, { badge: '' })}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        tier.badge === '' ? 'border-purple-500 ring-2 ring-purple-500/40' : 'border-gray-300 dark:border-gray-600'
                      } text-gray-700 dark:text-gray-300`}
                    >
                      <span className={`mr-2 inline-block h-3 w-3 rounded-full align-middle ${TIER_COLORS[tier.color].dot}`} />
                      {tx("Filament in the tier colour")}
                    </button>
                    {formData.badgeLibrary.map((badge) => (
                      <button
                        key={badge.id}
                        type="button"
                        title={badge.name}
                        aria-label={badge.name}
                        onClick={() => updateTier(index, { badge: badge.id })}
                        className={`rounded-lg border p-1 ${
                          tier.badge === badge.id ? 'border-purple-500 ring-2 ring-purple-500/40' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <BadgeImage svg={badgeProblem(badge.svg) ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"/>' : badge.svg} size={40} />
                      </button>
                    ))}
                  </div>
                </div>
                </div>
              ))}
            </div>
            <Button color="gray" size="sm" className="mt-3" onClick={addTier}>
              <HiPlus className="mr-1 h-4 w-4" />
              {tx("Add tier")}
            </Button>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {tx("Customers who were given a tier you remove lose it. Save the settings to apply the changes.")}
            </p>

            <div className="mt-6">
              <BadgeLibrary
                value={formData.badgeLibrary}
                onChange={(badgeLibrary) =>
                  setFormData((prev) => ({
                    ...prev,
                    badgeLibrary,
                    // a tier whose badge was removed has none
                    tierList: prev.tierList.map((tier) =>
                      tier.badge && !badgeLibrary.some((badge) => badge.id === tier.badge)
                        ? { ...tier, badge: '' }
                        : tier
                    ),
                  }))
                }
              />
            </div>

            <fieldset className="mt-6 space-y-2">
              <legend className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                {tx("Spending that counts")}
              </legend>
              {([
                ['all', tx("Everything the customer ever spent")],
                ['12m', tx("Only the last 12 months")],
              ] as const).map(([period, label]) => (
                <div key={period} className="flex items-center gap-2">
                  <Radio
                    id={`tier-period-${period}`}
                    name="tierPeriod"
                    checked={formData.tierPeriod === period}
                    onChange={() => setFormData({ ...formData, tierPeriod: period })}
                  />
                  <Label htmlFor={`tier-period-${period}`} value={label} />
                </div>
              ))}
            </fieldset>
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

          {tab === 'home-tiles' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <HomeTilesSettings
                value={formData.homeTiles}
                onChange={(homeTiles) => setFormData({ ...formData, homeTiles })}
              />
            </div>
          )}

          {tab === 'invoice-statuses' && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="space-y-8">
                <section className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {tx('Orders')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tx('Steps of an order, from accepting it to the receipt.')}
                    </p>
                  </div>
                  <BillingOptions
                    value={formData.billingOptions}
                    onChange={(billingOptions) =>
                      setFormData({ ...formData, billingOptions })
                    }
                  />
                </section>
                <section className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {tx('Offers')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tx('Steps of an offer (proforma). A step that changes the status to Accepted turns the offer into an order.')}
                    </p>
                  </div>
                  <BillingOptions
                    value={formData.offerOptions}
                    onChange={(offerOptions) =>
                      setFormData({ ...formData, offerOptions })
                    }
                  />
                </section>
              </div>
            </div>
          )}

          {tab === 'customer-flags' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <CustomerFlagsSettings
              value={formData.customerFlags}
              onChange={(customerFlags) => setFormData((prev) => ({ ...prev, customerFlags }))}
            />
          </div>
          )}

          {tab === 'zoho-campaigns' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <ZohoCampaignsSettings
              value={formData.zohoCampaigns}
              onChange={(zohoCampaigns) => setFormData((prev) => ({ ...prev, zohoCampaigns }))}
            />
          </div>
          )}

          {tab === 'newsletter-mail' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <NewsletterMailboxSettings
              value={formData.newsletterMailbox}
              onChange={(newsletterMailbox) => setFormData((prev) => ({ ...prev, newsletterMailbox }))}
            />
          </div>
          )}

          {tab === 'product-flags' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <CustomerFlagsSettings
              kind="product"
              value={formData.productFlags}
              onChange={(productFlags) => setFormData((prev) => ({ ...prev, productFlags }))}
            />
          </div>
          )}

          {tab === 'ribbons' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <RibbonsSettings
              value={formData.productRibbons}
              onChange={(productRibbons) => setFormData((prev) => ({ ...prev, productRibbons }))}
            />
          </div>
          )}

          {tab === 'avatars' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <AvatarsSettings
              value={formData.customerAvatars}
              onChange={(customerAvatars) => setFormData((prev) => ({ ...prev, customerAvatars }))}
            />
          </div>
          )}

          {tab === 'order-flags' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <CustomerFlagsSettings
              kind="order"
              value={formData.orderFlags}
              onChange={(orderFlags) => setFormData((prev) => ({ ...prev, orderFlags }))}
            />
          </div>
          )}

          {tab === 'assistant' && (
          <div id="assistant" className="scroll-mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <AssistantSettings
              value={formData.assistant}
              onChange={(assistant) => setFormData((prev) => ({ ...prev, assistant }))}
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
                    value={tx("Delivery Cost")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Standard delivery charge")}
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
                    value={tx("Free Delivery Threshold")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Minimum order value for free delivery")}
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
                    value={tx("Email(s)")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Company contact emails")}
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
                        placeholder={tx("contact@company.com")}
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
                  {tx("Add Email")}
                </Button>
              </div>

              {/* Company Phone */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyPhone"
                    value={tx("Phone Number")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Company contact phone")}
                  </p>
                </div>
                <TextInput
                  name="company.phone"
                  onChange={handleInputChange}
                  id="companyPhone"
                  type="tel"
                  value={formData.company.phone}
                  placeholder={tx("+387 XX XXX XXX")}
                />
              </div>

              {/* Bank account */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyBankAccount"
                    value={tx("Bank account")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Printed and emailed on proformas")}
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
                    value={tx("Town/City")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Company location")}
                  </p>
                </div>
                <TextInput
                  name="company.town"
                  onChange={handleInputChange}
                  id="companyTown"
                  type="text"
                  value={formData.company.town}
                  placeholder={tx("Banja Luka")}
                />
              </div>

              {/* Company Address */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="companyAddress"
                    value={tx("Address")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Company street address")}
                  </p>
                </div>
                <TextInput
                  name="company.address"
                  onChange={handleInputChange}
                  id="companyAddress"
                  type="text"
                  value={formData.company.address}
                  placeholder={tx("Street Name 123")}
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
                    value={tx("Facebook")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Facebook page URL")}
                  </p>
                </div>
                <TextInput
                  name="socialMedia.facebook"
                  onChange={handleInputChange}
                  id="socialMediaFacebook"
                  type="url"
                  value={formData.socialMedia.facebook}
                  placeholder={tx("https://facebook.com/yourpage")}
                />
              </div>

              {/* Instagram */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="socialMediaInstagram"
                    value={tx("Instagram")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("Instagram profile URL")}
                  </p>
                </div>
                <TextInput
                  name="socialMedia.instagram"
                  onChange={handleInputChange}
                  id="socialMediaInstagram"
                  type="url"
                  value={formData.socialMedia.instagram}
                  placeholder={tx("https://instagram.com/yourprofile")}
                />
              </div>

              {/* OLX */}
              <div className="w-full">
                <div className="mb-2 block">
                  <Label
                    className="text-base"
                    htmlFor="socialMediaOlx"
                    value={tx("OLX")}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {tx("OLX store URL")}
                  </p>
                </div>
                <TextInput
                  name="socialMedia.olx"
                  onChange={handleInputChange}
                  id="socialMediaOlx"
                  type="url"
                  value={formData.socialMedia.olx}
                  placeholder={tx("https://olx.ba/korisnik/yourstore")}
                />
              </div>
            </div>
          </div>
          )}

        </div>

        {/* Fixed Save Button */}
        <div className="sticky bottom-0 z-10 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex justify-end">
            <Button
              type="submit"
              isProcessing={loading}
              disabled={loading}
              size="md"
              color="purple"
            >
              {tx("Save Settings")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default GeneralSettings
