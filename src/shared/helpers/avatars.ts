// The avatars a customer can pick on the shop's profile page (same files and
// names as the shop: web/src/shared/avatars.ts). The profile keeps "avatar:NN".
export const AVATARS: Record<string, string> = {
  'avatar:01': 'Astronaut',
  'avatar:02': 'Nindža',
  'avatar:03': 'Čarobnjak',
  'avatar:04': 'Viking',
  'avatar:05': 'Pirat',
  'avatar:06': 'Mačak',
  'avatar:07': 'Lisica',
  'avatar:08': 'Vanzemaljac',
  'avatar:09': 'Vitez',
  'avatar:10': 'Robot',
}

/** The picked avatar, or null when the customer has not picked one. */
export const avatarOf = (image?: string | null): { src: string; name: string } | null =>
  image && AVATARS[image] ? { src: `/assets/avatars/${image.slice(7)}.svg`, name: AVATARS[image] } : null
