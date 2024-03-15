import { StateCreator } from 'zustand'
import { S3FormData } from '@/shared/types'
import { StoreManagerAPI } from '@/services'

export interface StoreManagerSliceInterface {
  s3FormData: S3FormData
  getS3FormData: () => Promise<S3FormData | null>
}

export const storeManagerSlice: StateCreator<StoreManagerSliceInterface> = (
  set,
  get
) => ({
  s3FormData: {} as S3FormData,

  getS3FormData: async () => {
    try {
      const data: S3FormData = await StoreManagerAPI.getS3FormData()

      return data
    } catch (error) {
      console.error('Error with getting data:', error)
    }
    return null
  },
})
