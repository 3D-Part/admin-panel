import { StateCreator } from 'zustand'
import { User } from '@/shared/types'

export interface CurrentUserSliceInterface {
  currentUser: User | null
  isLoading: boolean
  setCurrentUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearCurrentUser: () => void
}

export const currentUserSlice: StateCreator<CurrentUserSliceInterface> = (
  set
) => ({
  currentUser: null,
  isLoading: false,

  setCurrentUser: (user: User | null) => {
    set({ currentUser: user })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  clearCurrentUser: () => {
    set({ currentUser: null })
  },
})
