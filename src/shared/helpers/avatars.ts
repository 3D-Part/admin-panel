'use client'
import { useEffect, useState } from 'react'
import { SettingsAPI } from '@/services'

/**
 * The avatars customers can pick on the shop (settings `customerAvatars`):
 * the ten that come with the shop (public/assets/avatars/NN.svg, the same files
 * as the shop's) and the admin's uploads in the image bucket. The profile keeps
 * the avatar's id ("avatar:...") in `image`.
 */
export type CustomerAvatar = {
  id: string
  name: string
  // key of the uploaded picture; '' for one of the shop's ten
  image: string
  // kept by whoever has it, but not offered to pick
  hidden?: boolean
}

export const DEFAULT_AVATARS: CustomerAvatar[] = [
  ['01', 'Astronaut'],
  ['02', 'Nindža'],
  ['03', 'Čarobnjak'],
  ['04', 'Viking'],
  ['05', 'Pirat'],
  ['06', 'Mačak'],
  ['07', 'Lisica'],
  ['08', 'Vanzemaljac'],
  ['09', 'Vitez'],
  ['10', 'Robot'],
].map(([n, name]) => ({ id: `avatar:${n}`, name, image: '' }))

export const readCustomerAvatars = (settings: any): CustomerAvatar[] =>
  Array.isArray(settings?.customerAvatars) ? settings.customerAvatars : DEFAULT_AVATARS

/** The picture of an avatar. */
export const avatarImageSrc = (avatar: CustomerAvatar) =>
  avatar.image ? `${process.env.S3_URL}/${avatar.image}` : `/assets/avatars/${avatar.id.slice(7)}.svg`

/** A new id for an uploaded avatar. */
export const newAvatarId = (taken: string[]) => {
  let id = ''
  do id = `avatar:u${Math.random().toString(36).slice(2, 10)}`
  while (taken.includes(id))
  return id
}

// one request for the whole page, however many avatars it shows
let loading: Promise<CustomerAvatar[]> | null = null
let known: CustomerAvatar[] = DEFAULT_AVATARS
const listeners = new Set<(list: CustomerAvatar[]) => void>()

export const loadCustomerAvatars = (fresh = false): Promise<CustomerAvatar[]> => {
  if (!loading || fresh) {
    loading = SettingsAPI.getShopSettings().then((data) => {
      known = readCustomerAvatars(data?.settings)
      listeners.forEach((listener) => listener(known))
      return known
    })
  }
  return loading
}

/** The avatars of the settings; the shop's ten until they are loaded. */
export const useCustomerAvatars = (): CustomerAvatar[] => {
  const [list, setList] = useState<CustomerAvatar[]>(known)
  useEffect(() => {
    listeners.add(setList)
    loadCustomerAvatars().then(setList)
    return () => {
      listeners.delete(setList)
    }
  }, [])
  return list
}

/** The picked avatar, or null when there is none (or it was removed from the settings). */
export const avatarOf = (
  image: string | null | undefined,
  list: CustomerAvatar[] = known
): { src: string; name: string } | null => {
  const avatar = image ? list.find((item) => item.id === image) : undefined
  return avatar ? { src: avatarImageSrc(avatar), name: avatar.name } : null
}
