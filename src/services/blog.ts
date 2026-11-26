import { toast } from 'react-toastify'
import { tx } from '@/shared/i18n'
import { API } from '@/shared/helpers'

const API_BASE_URL = process.env.API_KEY
const BASE = `${API_BASE_URL}/backoffice/blog`

/** A post of the WordPress blog, as our API gives it (backoffice/blog). */
export interface BlogPost {
  id: number
  title: string
  content: string
  excerpt: string
  status: 'publish' | 'draft' | 'pending' | 'private' | 'future' | 'trash'
  slug: string
  link: string
  date: string
  modified: string
  categories: number[]
  featuredMedia: number | null
  featuredImage: string | null
}

export type BlogPostInput = {
  title: string
  content: string
  excerpt: string
  status: 'publish' | 'draft'
  slug: string
  categories: number[]
  featuredMedia: number | null
}

export type BlogCategory = { id: number; name: string; slug: string; count: number; parent: number }

/** What the API said is wrong, or a general message. */
export const blogError = (error: any, fallback = 'The blog could not be reached'): string =>
  error?.response?.data?.errors?.[0]?.message ?? fallback

/**
 * The admin already shows the API's own error message (with what to check);
 * only when no answer came at all is a message shown here, so it is never
 * shown twice.
 */
export const showBlogError = (error: any, fallback = 'The blog could not be reached') => {
  if (error?.response?.data) return
  toast(`${tx(fallback)}. ${tx('Check the connection: Settings → Blog (WordPress).')}`, {
    type: 'error',
    autoClose: 6000,
  })
}

const list = (query: { page?: number; search?: string; status?: string }) =>
  API.get<{ rows: BlogPost[]; count: number; pages: number }>(`${BASE}/posts`, query)

const get = (id: number) => API.get<BlogPost>(`${BASE}/posts/${id}`)

const create = (post: BlogPostInput) => API.post<BlogPostInput, BlogPost>(`${BASE}/posts`, post)

const update = (id: number, post: Partial<BlogPostInput>) =>
  API.put<Partial<BlogPostInput>, BlogPost>(`${BASE}/posts/${id}`, post)

const trash = (id: number) => API.remove(`${BASE}/posts/${id}`)

const categories = () => API.get<BlogCategory[]>(`${BASE}/categories`)

const createCategory = (name: string) => API.post<{ name: string }, BlogCategory>(`${BASE}/categories`, { name })

const uploadImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return API.post<FormData, { id: number; url: string; sourceUrl: string }>(`${BASE}/media`, form)
}

const test = () =>
  API.post<unknown, { ok: true; baseUrl: string; name: string; roles: string[]; canPublish: boolean }>(`${BASE}/test`, {})

const BlogAPI = { list, get, create, update, trash, categories, createCategory, uploadImage, test }

export default BlogAPI
