import { IconType } from 'react-icons'
import {
  RiAwardLine,
  RiFireLine,
  RiFlashlightLine,
  RiGift2Line,
  RiHeart3Line,
  RiLeafLine,
  RiPercentLine,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiStarLine,
  RiThumbUpLine,
  RiTimeLine,
  RiTruckLine,
} from 'react-icons/ri'

/**
 * Ribbons ("Novo", "Najprodavanije"...): kept in the settings, ticked on
 * products. A product keeps the ids of its ribbons in `icons`. The same preset
 * icons are drawn by the shop (web/src/shared/helper/productIcons).
 */
export type ProductRibbon = {
  id: string
  label: string
  color: string
  // a preset name, CUSTOM_ICON + image key of an upload, or '' for none
  icon: string
}

export const RIBBON_ICONS: Record<string, { icon: IconType; label: string }> = {
  star: { icon: RiStarLine, label: 'Star' },
  fire: { icon: RiFireLine, label: 'Fire' },
  truck: { icon: RiTruckLine, label: 'Truck' },
  leaf: { icon: RiLeafLine, label: 'Leaf' },
  award: { icon: RiAwardLine, label: 'Award' },
  shield: { icon: RiShieldCheckLine, label: 'Shield' },
  percent: { icon: RiPercentLine, label: 'Percent' },
  gift: { icon: RiGift2Line, label: 'Gift' },
  flash: { icon: RiFlashlightLine, label: 'Flash' },
  heart: { icon: RiHeart3Line, label: 'Heart' },
  thumb: { icon: RiThumbUpLine, label: 'Thumbs up' },
  tag: { icon: RiPriceTag3Line, label: 'Price tag' },
  time: { icon: RiTimeLine, label: 'Clock' },
}

// An uploaded icon is stored as this prefix plus its image key
export const CUSTOM_ICON = 'image:'

export const DEFAULT_RIBBON_COLOR = '#2f68c5'

// what the shop had before the ribbons could be edited, same ids
export const DEFAULT_RIBBONS: ProductRibbon[] = [
  { id: 'new', label: 'Novo', color: DEFAULT_RIBBON_COLOR, icon: 'star' },
  { id: 'best-seller', label: 'Najprodavanije', color: DEFAULT_RIBBON_COLOR, icon: 'fire' },
  { id: 'fast-delivery', label: 'Brza dostava', color: DEFAULT_RIBBON_COLOR, icon: 'truck' },
  { id: 'eco', label: 'Ekološki', color: DEFAULT_RIBBON_COLOR, icon: 'leaf' },
  { id: 'premium', label: 'Premium kvalitet', color: DEFAULT_RIBBON_COLOR, icon: 'award' },
  { id: 'warranty', label: 'Garancija', color: DEFAULT_RIBBON_COLOR, icon: 'shield' },
]

export const readProductRibbons = (settings: any): ProductRibbon[] =>
  Array.isArray(settings?.productRibbons) ? settings.productRibbons : DEFAULT_RIBBONS

/** The address of an uploaded icon. */
export const customIconSrc = (icon: string) => `${process.env.S3_URL}/${icon.slice(CUSTOM_ICON.length)}`

/** A lower-case id from the name, unique among the taken ones. */
export const ribbonIdFromLabel = (label: string, taken: string[]) => {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'dj')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 34) || 'ribbon'
  let id = base
  for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`
  return id
}

/** Why the list cannot be saved, or null. */
export const productRibbonsProblem = (ribbons: ProductRibbon[]) => {
  const names = ribbons.map((ribbon) => ribbon.label.trim().toLowerCase())
  if (names.some((name) => !name)) return 'Every ribbon needs a name.'
  if (names.some((name) => name.length > 30)) return 'A ribbon name can have at most 30 characters.'
  if (names.some((name, i) => names.indexOf(name) !== i)) return 'Two ribbons have the same name.'
  return null
}
