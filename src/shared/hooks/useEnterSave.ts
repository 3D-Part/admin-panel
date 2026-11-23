'use client'
import { KeyboardEvent, SyntheticEvent, useCallback, useRef } from 'react'

// inputs where Enter means "save"; not checkboxes, buttons, files, colors...
const TEXT_TYPES = new Set(['text', 'number', 'email', 'tel', 'url', 'password', 'search', 'date', 'datetime-local', 'time', 'month', 'week'])

/** True for a one-line text input that does not use Enter for itself. */
export const isEnterSaveTarget = (target: EventTarget | null) =>
  target instanceof HTMLInputElement &&
  TEXT_TYPES.has(target.type) &&
  !target.readOnly &&
  // e.g. a product search or the keywords, where Enter picks or adds
  !target.closest('[data-enter-ignore]')

/**
 * Runs `save` at most once at a time: calls while the previous one is still
 * running are ignored, so pressing Enter twice (or Enter and a click) cannot
 * save twice. An event passed in is always prevented, like a form submit.
 */
export const useSingleFlight = <A extends unknown[]>(
  save: (...args: A) => unknown
): ((...args: A) => Promise<void>) => {
  const busy = useRef(false)
  const latest = useRef(save)
  latest.current = save
  return useCallback(async (...args: A) => {
    const event = args[0] as SyntheticEvent | undefined
    if (event && typeof (event as SyntheticEvent).preventDefault === 'function') event.preventDefault()
    if (busy.current) return
    busy.current = true
    try {
      await latest.current(...args)
    } finally {
      busy.current = false
    }
  }, [])
}

/**
 * Enter in a one-line field of the form saves it, like the Save button. Put
 * the returned handler on the form's (or modal body's) onKeyDown. Textareas and
 * rich text editors keep Enter for a new line. `disabled`: nothing is saved
 * (e.g. while the form is incomplete or already saving).
 */
export const useEnterSave = (save: () => unknown, disabled = false) => {
  const once = useSingleFlight(save)
  return useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.defaultPrevented) return
      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.nativeEvent.isComposing || !isEnterSaveTarget(event.target)) return
      // no native submit of a surrounding <form> (it would reload the page)
      event.preventDefault()
      if (event.repeat || disabled) return
      once()
    },
    [once, disabled]
  )
}
