import { API } from '@/shared/helpers'
import JWT from '@/shared/helpers/jwtToken'
import {
    GetNewAccessTokenResponseData,
    LoginData,
    LoginResponseData,
} from '@/shared/types'

const API_BASE_URL = process.env.API_KEY

const login = async (body: LoginData): Promise<LoginResponseData | null> => {
    try {
        const data: LoginResponseData = await API.post(
            `${API_BASE_URL}/auth/login/`,
            body
        )

        JWT.addJwtTokens(data)
        return data
    } catch (error) {
        return null
    }
}
const logout = async () => {
    try {
        await API.post(`${API_BASE_URL}/auth/logout/`)
    } catch (error) {
        return null
    }
}

const getNewAccessToken = async (body: {
    refreshToken: string
}): Promise<GetNewAccessTokenResponseData | null> => {
    try {
        return await API.post(
            `${API_BASE_URL}/auth/get-new-access-token/`,
            body
        )
    } catch (error) {
        return null
    }
}

const AuthAPI = {
    login,
    logout,
    getNewAccessToken,
}

export default AuthAPI
