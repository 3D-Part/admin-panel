const isoToDatetimeLocal = (isoString: string) => {
  if (!isoString) return ''

  // Remove milliseconds and time zone offset
  var dateTime = isoString.replace(/\.\d+Z$/, '')

  // Convert T to space
  dateTime = dateTime.replace('T', ' ')

  // Return formatted datetime string
  return dateTime
}

export default isoToDatetimeLocal
