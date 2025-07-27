import { StateCreator } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeSliceInterface {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const themeSlice: StateCreator<ThemeSliceInterface> = (set, get) => ({
  theme: 'dark', // Default to dark theme

  setTheme: (theme: Theme) => {
    set({ theme })

    // Apply theme to document
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else if (theme === 'system') {
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
  },

  toggleTheme: () => {
    const currentTheme = get().theme
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    get().setTheme(newTheme)
  },
})
