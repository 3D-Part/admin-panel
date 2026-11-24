import { API } from '@/shared/helpers'

const API_BASE_URL = process.env.API_KEY

/** A page of the shop at /info/<slug> (backoffice/info-pages). */
export interface InfoPage {
  id: string
  title: string
  slug: string
  body: string
  published: boolean
  seoTitle: string | null
  seoDescription: string | null
  showInFooter: boolean
  position: number
  updatedAt: string
}

export type InfoPageInput = Omit<InfoPage, 'id' | 'updatedAt'>

/** What the API said is wrong, or a general message. */
export const infoPageError = (error: any): string =>
  error?.response?.data?.errors?.[0]?.message ?? 'The page could not be saved'

const list = async (): Promise<InfoPage[]> => {
  const data = await API.get<{ rows: InfoPage[] }>(`${API_BASE_URL}/backoffice/info-pages`)
  return data?.rows ?? []
}

const get = (id: string) => API.get<InfoPage>(`${API_BASE_URL}/backoffice/info-pages/${id}`)

const create = (page: InfoPageInput) =>
  API.post<InfoPageInput, InfoPage>(`${API_BASE_URL}/backoffice/info-pages`, page)

const update = (id: string, page: Partial<InfoPageInput>) =>
  API.put<Partial<InfoPageInput>, InfoPage>(`${API_BASE_URL}/backoffice/info-pages/${id}`, page)

const remove = (id: string) => API.remove(`${API_BASE_URL}/backoffice/info-pages/${id}`)

const InfoPagesAPI = { list, get, create, update, remove }

export default InfoPagesAPI
