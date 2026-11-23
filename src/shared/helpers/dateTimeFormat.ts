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

/** "24.11.2026" or, with the time, "24.11.2026 14:05"; "—" when there is no date. */
export const shortDateTime = (iso?: string | null, withTime = false): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day
}

export default dateTimeFormat
