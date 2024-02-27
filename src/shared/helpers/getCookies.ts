const getCookie = (name: string): string => {
  if (typeof document === 'undefined') {
    return ''
  }

  const token = document.cookie.replace(
    new RegExp(`(?:(?:^|.*;\\s*)${name}\\s*=\\s*([^;]*).*$)|^.*$`),
    '$1'
  )

  if (token) {
    return token
  } else {
    return ''
  }
}
export default getCookie
