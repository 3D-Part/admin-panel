import axios from 'axios'
import { toast } from 'react-toastify'
import { ErrorCodeEnum, ErrorsEnum, URLPartsEnum } from '../enums'
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

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie('accessToken')
        // If a token exists, add it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
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

        toast(activeErrorMessage, {
            hideProgressBar: true,
            autoClose: 2000,
            type: 'error',
        })
        // if (originalRequest._retry) {
        //     console.log('sada bi trebalo da preki i ne posalje request')
        //     return
        // }
        if (
            _errorResponse.status === ErrorCodeEnum.Unauthorized &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true

            if (originalRequest.url.includes('get-new-access-token')) {
                const message =
                    'Your session has expired, you will have to login again'

                toast(message, {
                    hideProgressBar: true,
                    autoClose: 2000,
                    type: 'warning',
                })

                setTimeout(() => {
                    window.location.href = URLPartsEnum.Login
                }, 3000)

                return
            }

            try {
                const refreshToken = getCookie('refreshToken')
                const response = await AuthAPI.getNewAccessToken({
                    refreshToken: refreshToken,
                })
                if (response?.accessToken) {
                    JWT.changeAccessToken(response?.accessToken)
                    // update request with new accessToken
                    originalRequest.headers[
                        'Authorization'
                    ] = `Bearer ${response.accessToken}`
                }

                return axios(originalRequest)
            } catch (error) {}
        }

        // Don't forget to re-throw the error so that components using Axios can continue further error handling if necessary
        return Promise.reject(error)
    }
)

export default axiosInstance
