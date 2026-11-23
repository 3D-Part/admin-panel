'use client'
import { tx } from '@/shared/i18n'
import { avatarOf, useCustomerAvatars } from '@/shared/helpers/avatars'

/**
 * The avatar a customer picked on the shop, or their first letter when they
 * have not picked one (or it was removed in Settings → Avatars). The name of the avatar shows on hover.
 */
export const UserAvatar: React.FC<{ image?: string | null; name?: string; size?: number }> = ({
  image,
  name,
  size = 28,
}) => {
  const avatar = avatarOf(image, useCustomerAvatars())
  const style = { width: size, height: size }
  if (!avatar) {
    return (
      <span
        title={tx('No avatar picked')}
        style={style}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-200"
      >
        {(name?.trim()[0] ?? '?').toUpperCase()}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={avatar.src}
      alt={avatar.name}
      title={avatar.name}
      style={style}
      className="shrink-0 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
    />
  )
}

export default UserAvatar
