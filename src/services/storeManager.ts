import { API } from '@/shared/helpers'
import { S3FormData } from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const getS3FormData = async (): Promise<S3FormData> => {
  try {
    const data: S3FormData = await API.post(
      `${API_BASE_URL}/storage-manager/storeUrl`
    )
    return data
  } catch (error) {
    console.error('Error fetching store url data:', error)
    return {} as S3FormData
  }
}

const uploadImagesOnS3 = async (
  formData: FormData,
  s3Url: string
): Promise<boolean> => {
  try {
    const data = await API.postS3(s3Url, formData)
    return true
  } catch (error) {
    console.error('Error uploading image:', error)
    return false
  }
}

const StoreManagerAPI = {
  getS3FormData,
  uploadImagesOnS3,
}

export default StoreManagerAPI
