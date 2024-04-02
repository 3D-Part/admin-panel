import { LoginResponseData } from '../types'

const deleteJwtTokens = () => {
  const accessTokenCookieName = 'accessToken'
  const refreshTokenCookieName = 'refreshToken'

  // Set the cookie expiration date to the previous moment (01.01.1970)
  const expirationDate = new Date(0)
  // Setting cookies with an expiration date on the previous date
  document.cookie = `${accessTokenCookieName}=;expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`
  document.cookie = `${refreshTokenCookieName}=;expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`
}

const changeAccessToken = (token: string) => {
  const expirationDate = new Date(0)
  const accessTokenCookieName = 'accessToken'

  document.cookie = `${accessTokenCookieName}=;expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`
  document.cookie = `accessToken=${token}; SameSite=Strict`
}

const addJwtTokens = (data: LoginResponseData) => {
  deleteJwtTokens()
  document.cookie = `accessToken=${data.accessToken}; SameSite=Strict`
  document.cookie = `refreshToken=${data.refreshToken}; SameSite=Strict`
}

const JWT = {
  addJwtTokens,
  deleteJwtTokens,
  changeAccessToken,
}

export default JWT
