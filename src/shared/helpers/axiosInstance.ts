import axios from 'axios'
import { toast } from 'react-toastify'
import { ErrorCodeEnum, URLPartsEnum } from '../enums'
import { AuthAPI } from '@/services'
import getCookie from '@/shared/helpers/getCookies'
import JWT from './jwtToken'

const API_BASE_URL = process.env.API_KEY

type ErrorType = {
  message: string
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
})

// Track if we're currently refreshing the token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken')
    // If a token exists, add it to the Authorization header

    if (!config.url?.includes('amazon')) {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    // If an error occurs during the creation of the request (eg in the case of a network error), it will be caught here
    console.error('Error occurred:', error)
    return Promise.reject(error)
  }
)

// We add an interceptor to catch errors in responses
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const _errorResponse = error.response

    const _errors: ErrorType[] = _errorResponse.data.errors as ErrorType[]
    let activeErrorMessage = ''

    if (_errors?.length > 0 && _errors[0].message) {
      activeErrorMessage = _errors[0].message
    } else if (error.response.data.message) {
      activeErrorMessage = error.response.data.message
    } else {
      activeErrorMessage = error.message
    }

    const errorUrl = error.response.config.url

    if (
      errorUrl.includes('/shop/sale/get-active-sale') &&
      error.response.status === 404
    )
      return

    // Handle 401 Unauthorized errors
    if (_errorResponse.status === ErrorCodeEnum.Unauthorized) {
      // If this is a refresh token request that failed, redirect to login immediately
      if (
        originalRequest.url &&
        originalRequest.url.includes('get-new-access-token')
      ) {
        const message = 'Your session has expired, you will have to login again'

        toast(message, {
          hideProgressBar: true,
          autoClose: 2000,
          type: 'warning',
        })

        // Clear tokens
        JWT.deleteJwtTokens()

        window.location.href = URLPartsEnum.Login

        return Promise.reject(error)
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return axios(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      // Only retry if we haven't already tried
      if (!originalRequest._retry) {
        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = getCookie('refreshToken')

          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await AuthAPI.getNewAccessToken({
            refreshToken: refreshToken,
          })

          if (response?.accessToken) {
            JWT.changeAccessToken(response.accessToken)

            // Update the original request with new token
            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${response.accessToken}`

            // Process queued requests
            processQueue(null, response.accessToken)

            return axios(originalRequest)
          } else {
            throw new Error('Failed to get new access token')
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          JWT.deleteJwtTokens()
          processQueue(refreshError, null)

          const message =
            'Your session has expired, you will have to login again'
          toast(message, {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'warning',
          })

          setTimeout(() => {
            window.location.href = URLPartsEnum.Login
          }, 2000)

          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }
    }

    // Show error toast for non-401 errors (except UNAUTHORIZED_ERROR)
    if (_errorResponse?.data?.key !== 'UNAUTHORIZED_ERROR') {
      toast(activeErrorMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: 'error',
      })
    }

    // Don't forget to re-throw the error so that components using Axios can continue further error handling if necessary
    return Promise.reject(error)
  }
)

export default axiosInstance
