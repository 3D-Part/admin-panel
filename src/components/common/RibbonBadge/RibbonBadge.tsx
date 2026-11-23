'use client'
import React from 'react'
import { CUSTOM_ICON, ProductRibbon, RIBBON_ICONS, customIconSrc } from '@/shared/helpers/productIcons'

/** A ribbon as the shop shows it: its color, icon and name. */
const RibbonBadge: React.FC<{ ribbon: Pick<ProductRibbon, 'label' | 'color' | 'icon'>; className?: string }> = ({
  ribbon,
  className = '',
}) => {
  const Preset = RIBBON_ICONS[ribbon.icon]?.icon
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-r-lg py-1 pl-2 pr-3 text-xs font-bold text-white shadow ${className}`}
      style={{ backgroundColor: ribbon.color }}
    >
      {ribbon.icon.startsWith(CUSTOM_ICON) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" src={customIconSrc(ribbon.icon)} className="h-3.5 w-3.5 shrink-0 object-contain" />
      ) : (
        Preset && <Preset className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      {ribbon.label || '…'}
    </span>
  )
}

export default RibbonBadge
