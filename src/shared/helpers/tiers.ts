// The discount tiers as the admin edits them (Settings → Discount tiers).
// The API reads the same list; settings saved before it existed hold three
// fixed tiers, which read here as a list of three.

export type TierRow = {
  id: string
  name: string
  // text of the fields while typing
  discount: string
  threshold: string
  color: string
  // id of a badge of the library, '' for none
  badge: string
}

// every class is written out so the build keeps it
export const TIER_COLORS: Record<string, { label: string; badge: string; dot: string }> = {
  amber: { label: 'Bronze', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200', dot: 'bg-amber-600' },
  slate: { label: 'Silver', badge: 'bg-slate-200 text-slate-800 dark:bg-slate-600/50 dark:text-slate-100', dot: 'bg-slate-400' },
  yellow: { label: 'Gold', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', dot: 'bg-yellow-500' },
  blue: { label: 'Blue', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', dot: 'bg-blue-500' },
  green: { label: 'Green', badge: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', dot: 'bg-green-500' },
  purple: { label: 'Purple', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200', dot: 'bg-purple-500' },
  red: { label: 'Red', badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', dot: 'bg-red-500' },
  pink: { label: 'Pink', badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200', dot: 'bg-pink-500' },
}

const LEGACY = [
  { id: 'BRONZE', name: 'Bronze', color: 'amber', badge: '' },
  { id: 'SILVER', name: 'Silver', color: 'slate', badge: '' },
  { id: 'GOLD', name: 'Gold', color: 'yellow', badge: '' },
]

type Stored = Record<string, any>

/** The tiers in the saved settings, as rows for the form. */
export const readTierRows = (settings: Stored | undefined): TierRow[] => {
  if (Array.isArray(settings?.tierList)) {
    return settings!.tierList.map((tier: Stored) => ({
      id: String(tier.id),
      name: String(tier.name ?? tier.id),
      discount: String(tier.discount ?? ''),
      threshold: tier.threshold ? String(tier.threshold) : '',
      color: TIER_COLORS[tier.color] ? tier.color : 'slate',
      badge: typeof tier.badge === 'string' ? tier.badge : '',
    }))
  }
  return LEGACY.map((tier) => ({
    ...tier,
    discount: String(settings?.tiers?.[tier.id.toLowerCase()] ?? ''),
    threshold: settings?.tierThresholds?.[tier.id.toLowerCase()]
      ? String(settings.tierThresholds[tier.id.toLowerCase()])
      : '',
  }))
}

/** An id for a new tier from its name, one that no other tier has. */
export const newTierId = (name: string, taken: string[]) => {
  const base =
    name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24) || 'TIER'
  let id = base
  for (let n = 2; taken.includes(id); n += 1) id = `${base}_${n}`
  return id
}

/** What goes into the settings: the list, plus the old three keys for readers that still use them. */
export const tierSettings = (rows: TierRow[]) => {
  const tierList = rows.map((row) => ({
    id: row.id,
    name: row.name.trim(),
    discount: parseFloat(row.discount) || 0,
    threshold: parseFloat(row.threshold) || 0,
    color: row.color,
    badge: row.badge || null,
  }))
  const legacy = (key: 'discount' | 'threshold') =>
    Object.fromEntries(
      LEGACY.map(({ id }) => [id.toLowerCase(), tierList.find((tier) => tier.id === id)?.[key] ?? 0])
    )
  return { tierList, tiers: legacy('discount'), tierThresholds: legacy('threshold') }
}

/** Tiers lowest first: a bigger discount is a higher tier. */
export const sortTiers = <T extends { discount: string | number }>(rows: T[]) =>
  rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => Number(a.row.discount) - Number(b.row.discount) || a.index - b.index)
    .map(({ row }) => row)

// ---- badge pictures (settings.badgeLibrary) ----

export type BadgeItem = { id: string; name: string; svg: string }

/** Every badge is this many units wide and high, so they line up everywhere. */
export const BADGE_SIZE = 64

/** An SVG as a picture source; shown through <img>, so nothing in it can run. */
export const svgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

/** Why an SVG is not accepted, or null. The API checks the same again when saving. */
export const badgeProblem = (svg: string): string | null => {
  const text = svg.trim()
  if (text.length > 20000) return 'The badge is too big (20 KB at most).'
  if (!/^<svg[\s>]/i.test(text) || !/<\/svg>\s*$/i.test(text)) return 'The file must be one SVG.'
  if (!/\sviewBox\s*=\s*["']\s*0\s+0\s+64\s+64\s*["']/i.test(text)) {
    return `The badge must have viewBox="0 0 ${BADGE_SIZE} ${BADGE_SIZE}": the same size for every badge.`
  }
  const head = text.slice(0, text.indexOf('>') + 1)
  for (const name of ['width', 'height']) {
    const match = head.match(new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
    if (match && parseFloat(match[1]) !== BADGE_SIZE) return `The badge ${name} must be ${BADGE_SIZE}.`
  }
  if (
    /<\s*(script|foreignObject|iframe|object|embed|image|use|style)\b/i.test(text) ||
    /\son[a-z]+\s*=/i.test(text) ||
    /javascript:/i.test(text) ||
    /(href|src)\s*=\s*["']\s*(https?:|data:|\/\/)/i.test(text) ||
    /url\(\s*["']?\s*(https?:|data:|\/\/)/i.test(text)
  ) {
    return 'A badge may only draw shapes: no scripts, images or links.'
  }
  return null
}

/** A new empty badge to start from: a plate with a star, 64 by 64. */
export const blankBadge = (id: string, name: string): BadgeItem => ({
  id,
  name,
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n  <circle cx="32" cy="32" r="30" fill="#3b82f6" stroke="#1e3a8a" stroke-width="2"/>\n  <path d="M32 14l5.5 11.2 12.3 1.8-8.9 8.7 2.1 12.3L32 42.200l-11 5.800 2.1-12.300-8.9-8.700 12.300-1.800z" fill="#fff"/>\n</svg>',
})
