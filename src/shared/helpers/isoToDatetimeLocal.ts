const pad = (value: number) => String(value).padStart(2, '0')

/** Stored time to what a datetime-local input shows, in the viewer's time zone. */
const isoToDatetimeLocal = (isoString: string) => {
  if (!isoString) return ''

  const date = new Date(isoString)
  if (isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** What a datetime-local input holds to the exact moment the server stores. */
export const datetimeLocalToIso = (value?: string) => {
  if (!value) return value as string

  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toISOString()
}

export default isoToDatetimeLocal
