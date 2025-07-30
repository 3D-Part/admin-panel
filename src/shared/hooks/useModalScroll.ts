import { useEffect } from 'react'

export const useModalScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Disable scroll on body
      document.body.style.overflow = 'hidden'
      // Prevent scroll on mobile devices
      // document.body.style.position = 'fixed'
      // document.body.style.width = '100%'
    } else {
      // Re-enable scroll on body
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])
}
