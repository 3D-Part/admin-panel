import axiosInstance from './axiosInstance'

/**
 *
 * Get method
 * @param url
 * @param params
 */

const get = async <T>(
  url: string,
  params?: Record<string, any>,
  headers?: Record<string, any>
): Promise<T> => {
  try {
    const combineHeaders = {
      ...headers,
      // "Access-Control-Allow-Credentials": true,
    }
    const res = await axiosInstance({
      method: 'get',
      url: url,
      params,
      headers: combineHeaders,
    })

    return res.data as T
  } catch (err) {
    throw err
  }
}

/**
 *
 * Post method
 * @param url
 * @param data
 * @param params
 */
const post = async <T1, T2>(
  url: string,
  data?: T1,
  params?: string | null,
  headers?: Record<string, any>
): Promise<T2> => {
  try {
    const combineHeaders = {
      ...headers,
    }

    const res = await axiosInstance({
      method: 'post',
      url: url,
      data,
      params,
      headers: combineHeaders,
      // withCredentials: true,
    })
    return res.data as T2
  } catch (err) {
    throw err
  }
}
const postS3 = async <T1, T2>(
  url: string,
  data?: T1,
  params?: string | null,
  headers?: Record<string, any>
): Promise<T2> => {
  try {
    // Get the accessToken token from the cookie (if it's stored there)

    // Set the "Authorization" header with the JWT token
    const combineHeaders = {
      // " Access-Control-Allow-Origin":
      //   "https://bucket3dparts.s3.eu-central-1.amazonaws.com/",
      'Content-Type': 'multipart/form-data',
      // "Access-Control-Allow-Methods": "POST, GET, OPTION",
      ...headers,
    }

    const res = await axiosInstance({
      method: 'post',
      url: url,
      data,
      params,
      headers: combineHeaders,
    })
    return res.data as T2
  } catch (err) {
    throw err
  }
}

/**
 *
 * Remove method
 * @param url
 * @param params
 */
const remove = async <T1>(
  url: string,
  data?: T1,
  params?: string,
  auth?: boolean,
  headers?: Record<string, any>
): Promise<boolean> => {
  try {
    const combineHeaders = {
      ...headers,
    }

    const res = await axiosInstance({
      method: 'delete',
      url: url,
      data,
      params,
      headers: combineHeaders,
    })

    return res.data as boolean
  } catch (err) {
    throw err
  }
}

/**
 *
 * Put method
 * @param url
 * @param data
 * @param params
 */
const put = async <T1, T2>(
  url: string,
  data?: T1,
  params?: string | null,
  headers?: Record<string, any>
): Promise<T2> => {
  try {
    const combineHeaders = {
      ...headers,
    }

    const res = await axiosInstance({
      method: 'put',
      url: url,
      data,
      params,
      headers: combineHeaders,
    })
    return res.data as T2
  } catch (err) {
    throw err
  }
}

/**
 *
 * Patch method
 * @param url
 * @param data
 * @param params
 */
const patch = async <T1, T2>(
  url: string,
  data?: T1,
  params?: string | null,
  headers?: Record<string, any>
): Promise<T2> => {
  try {
    const combineHeaders = {
      ...headers,
    }

    const res = await axiosInstance({
      method: 'patch',
      url: url,
      data,
      params,
      headers: combineHeaders,
    })
    return res.data as T2
  } catch (err) {
    throw err
  }
}

const helpers = {
  get,
  post,
  postS3,
  remove,
  put,
  patch,
}

export default helpers
