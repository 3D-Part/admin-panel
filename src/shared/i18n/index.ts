import { create } from 'zustand'
import sr from './sr'

export type Language = 'en' | 'sr'

const LANGUAGE_KEY = 'adminLanguage'

type LanguageState = {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en',
  setLanguage: (language) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language)
    } catch {}
    set({ language })
  },
}))

export const readStoredLanguage = (): Language => {
  try {
    // the guide had its own switch before the whole admin got one
    const stored =
      localStorage.getItem(LANGUAGE_KEY) ?? localStorage.getItem('guideLanguage')
    return stored === 'sr' ? 'sr' : 'en'
  } catch {
    return 'en'
  }
}

/**
 * The English text is the key. A text without a Serbian entry stays in
 * English, so a missed one is never blank. {name} marks a value to fill in.
 * The whole admin is mounted again when the language changes, so a plain
 * call works in components, stores and toasts alike.
 */
export const tx = (
  text: string,
  values?: Record<string, string | number | null | undefined>
) => {
  const translated =
    useLanguageStore.getState().language === 'sr' ? sr[text] ?? text : text
  if (!values) return translated
  return translated.replace(/\{(\w+)\}/g, (match, name) =>
    name in values ? String(values[name] ?? '') : match
  )
}
