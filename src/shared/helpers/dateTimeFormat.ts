const dateTimeFormat = (
  isoDate: string,
  includeTime: boolean = false
): string => {
  const date = new Date(isoDate)
  const year = date.toLocaleString('en-US', { year: 'numeric' })
  const month = date.toLocaleString('en-US', { month: '2-digit' })
  const day = date.toLocaleString('en-US', { day: '2-digit' })
  let formattedDate = `${day}.${month}.${year}`

  if (includeTime) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    formattedDate += ` - ${hours}:${minutes}:${seconds}`
  }

  return formattedDate
}

export default dateTimeFormat
