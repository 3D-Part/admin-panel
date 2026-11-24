'use client'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge, Button, Checkbox, Label, Select, Table, TextInput, Textarea } from 'flowbite-react'
import { Pagination } from '@/components/common/TablePagination/TablePagination'
import { HiExternalLink, HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import TextEditor from '@/components/common/TextEditor'
import BlogAPI, { BlogCategory, BlogPost, BlogPostInput, blogError } from '@/services/blog'
import { URLPartsEnum } from '@/shared/enums'

const EMPTY: BlogPostInput = {
  title: '',
  content: '',
  excerpt: '',
  status: 'draft',
  slug: '',
  categories: [],
  featuredMedia: null,
}

/** "Novi filamenti čćž" -> "novi-filamenti-ccz", as WordPress would make it. */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[čćšžđ]/g, (letter) => ({ č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj' })[letter] as string)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
  publish: { color: 'success', label: 'Published' },
  draft: { color: 'gray', label: 'Draft' },
  pending: { color: 'warning', label: 'Pending review' },
  private: { color: 'purple', label: 'Private' },
  future: { color: 'info', label: 'Scheduled' },
}

const day = (value: string) => (value ? new Date(value).toLocaleDateString('de-DE') : '')
// WordPress gives the title as HTML (&#8211; and the like)
const decode = (value: string) => {
  if (typeof document === 'undefined') return value
  const area = document.createElement('textarea')
  area.innerHTML = value
  return area.value
}

/** The blog is not connected (or does not answer): what to do. */
const Problem: React.FC<{ message: string }> = ({ message }) => (
  <div className="max-w-3xl space-y-3" data-testid="blog-problem">
    <p className="font-medium text-gray-900 dark:text-white">{tx(message)}</p>
    <p className="text-sm text-gray-600 dark:text-gray-300">
      {tx('In WordPress: Users → Profile → Application Passwords, give it a name (e.g. 3D Part admin) and click Add New Application Password; copy the password shown. Then here: Settings → Blog (WordPress): the blog address, the WordPress user name and that password, Save Settings and Check the connection.')}
    </p>
    <div className="flex gap-2">
      <Button size="sm" href={`${URLPartsEnum.SettingsGeneral}?tab=blog`}>
        {tx('Open the settings')}
      </Button>
      <Button size="sm" color="gray" href={URLPartsEnum.Guide}>
        {tx('Guide')}
      </Button>
    </div>
  </div>
)

const List: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const [data, setData] = useState<{ rows: BlogPost[]; count: number; pages: number } | null>(null)
  const [problem, setProblem] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(() => {
    setData(null)
    BlogAPI.list({ page, ...(search && { search }), ...(status && { status }) })
      .then((result) => {
        setProblem(null)
        setData(result)
      })
      .catch((error) => {
        setProblem(blogError(error))
        setData({ rows: [], count: 0, pages: 1 })
      })
  }, [page, search, status])
  useEffect(load, [load])

  const trash = async (post: BlogPost) => {
    if (!window.confirm(tx('Move "{title}" to the WordPress trash? It disappears from the blog; it can be restored in WordPress.', { title: decode(post.title) }))) return
    try {
      await BlogAPI.trash(post.id)
      toast(tx('The post is in the WordPress trash'), { type: 'success', autoClose: 2500 })
      load()
    } catch (error) {
      toast(tx(blogError(error)), { type: 'error', autoClose: 4000 })
    }
  }

  if (problem) return <Problem message={problem} />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <Label htmlFor="blog-search" value={tx('Search')} />
          <TextInput id="blog-search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="blog-status" value={tx('Status')} />
          <Select
            id="blog-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            <option value="">{tx('All')}</option>
            <option value="publish">{tx('Published')}</option>
            <option value="draft">{tx('Draft')}</option>
          </Select>
        </div>
        <Button size="sm" className="ml-auto" onClick={() => onOpen('new')}>
          <HiPlus className="mr-1 h-4 w-4" /> {tx('New post')}
        </Button>
      </div>
      {data === null ? (
        <p className="text-gray-500 dark:text-gray-400">{tx('Loading...')}</p>
      ) : data.rows.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{tx('No posts.')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="w-20">
                <span className="sr-only">{tx('Picture')}</span>
              </Table.HeadCell>
              <Table.HeadCell>{tx('Title')}</Table.HeadCell>
              <Table.HeadCell>{tx('Status')}</Table.HeadCell>
              <Table.HeadCell>{tx('Date')}</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">{tx('Actions')}</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {data.rows.map((post) => {
                const badge = STATUS_BADGE[post.status] ?? { color: 'gray', label: post.status }
                return (
                  <Table.Row
                    key={post.id}
                    className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                    onClick={() => onOpen(String(post.id))}
                  >
                    <Table.Cell>
                      {post.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.featuredImage} alt="" className="h-12 w-16 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-16 rounded bg-gray-100 dark:bg-gray-700" />
                      )}
                    </Table.Cell>
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {decode(post.title) || tx('(no title)')}
                      <div className="text-xs font-normal text-gray-500 dark:text-gray-400">/{post.slug}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex">
                        <Badge color={badge.color}>{tx(badge.label)}</Badge>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap">{day(post.date)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {post.status === 'publish' && post.link && (
                          <Button size="xs" color="gray" href={post.link} target="_blank" aria-label={tx('View on the blog')}>
                            <HiExternalLink />
                          </Button>
                        )}
                        <Button size="xs" color="gray" aria-label={tx('Edit')} onClick={() => onOpen(String(post.id))}>
                          <HiPencil />
                        </Button>
                        <Button size="xs" color="failure" aria-label={tx('Move to trash')} onClick={() => trash(post)}>
                          <HiTrash />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      )}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{tx('Total: {count}', { count: data.count })}</span>
        </div>
      )}
    </div>
  )
}

const Categories: React.FC<{ value: number[]; onChange: (next: number[]) => void }> = ({ value, onChange }) => {
  const [categories, setCategories] = useState<BlogCategory[] | null>(null)
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    BlogAPI.categories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const add = async () => {
    if (!name.trim()) return
    setAdding(true)
    try {
      const category = await BlogAPI.createCategory(name.trim())
      setCategories((prev) => [...(prev ?? []), category])
      onChange([...value, category.id])
      setName('')
    } catch (error) {
      toast(tx(blogError(error)), { type: 'error', autoClose: 4000 })
    }
    setAdding(false)
  }

  return (
    <div>
      <Label value={tx('Categories')} />
      {categories === null ? (
        <p className="text-sm text-gray-500">{tx('Loading...')}</p>
      ) : (
        <div className="mt-1 max-h-48 space-y-1 overflow-auto">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Checkbox
                checked={value.includes(category.id)}
                onChange={(e) =>
                  onChange(e.target.checked ? [...value, category.id] : value.filter((id) => id !== category.id))
                }
              />
              {decode(category.name)}
            </label>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <TextInput
          sizing="sm"
          className="flex-1"
          placeholder={tx('New category')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button size="xs" color="gray" disabled={adding || !name.trim()} onClick={add}>
          {tx('Add')}
        </Button>
      </div>
    </div>
  )
}

const Editor: React.FC<{ id: string; onClose: () => void; onSaved: (id: string) => void }> = ({ id, onClose, onSaved }) => {
  const isNew = id === 'new'
  const [post, setPost] = useState<BlogPostInput | null>(isNew ? EMPTY : null)
  const [saved, setSaved] = useState<BlogPost | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) return
    BlogAPI.get(Number(id))
      .then((data) => {
        setSaved(data)
        setImage(data.featuredImage)
        setPost({
          title: decode(data.title),
          content: data.content ?? '',
          excerpt: data.excerpt ?? '',
          status: data.status === 'publish' ? 'publish' : 'draft',
          slug: data.slug,
          categories: data.categories,
          featuredMedia: data.featuredMedia,
        })
      })
      .catch((error) => {
        toast(tx(blogError(error, 'The post could not be loaded')), { type: 'error', autoClose: 4000 })
        onClose()
      })
  }, [id, isNew, onClose])

  if (!post) return <p className="text-gray-500 dark:text-gray-400">{tx('Loading...')}</p>

  const change = (patch: Partial<BlogPostInput>) => setPost((current) => ({ ...(current as BlogPostInput), ...patch }))

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    setUploading(true)
    try {
      const media = await BlogAPI.uploadImage(picked)
      change({ featuredMedia: media.id })
      setImage(media.url)
      toast(tx('Picture uploaded to the blog'), { type: 'success', autoClose: 2000 })
    } catch (error) {
      toast(tx(blogError(error, 'The picture could not be uploaded')), { type: 'error', autoClose: 4000 })
    }
    setUploading(false)
  }

  const save = async (status: 'draft' | 'publish') => {
    if (!post.title.trim()) {
      toast(tx('The post needs a title'), { type: 'error', autoClose: 3000 })
      return
    }
    setSaving(true)
    try {
      const body = { ...post, status, title: post.title.trim(), slug: post.slug.trim() }
      const result = isNew ? await BlogAPI.create(body) : await BlogAPI.update(Number(id), body)
      setSaved(result)
      setPost((current) => ({ ...(current as BlogPostInput), status, slug: result.slug }))
      toast(
        tx(status === 'publish' ? 'Published on the blog' : 'Saved as a draft, not on the blog'),
        { type: 'success', autoClose: 2500 }
      )
      onSaved(String(result.id))
    } catch (error) {
      toast(tx(blogError(error, 'The post could not be saved')), { type: 'error', autoClose: 5000 })
    }
    setSaving(false)
  }

  const published = saved?.status === 'publish'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save(published ? 'publish' : 'draft')
      }}
      className="space-y-5"
    >
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="blog-title" value={tx('Title')} />
            <TextInput
              id="blog-title"
              value={post.title}
              maxLength={300}
              required
              onChange={(e) =>
                change({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })
              }
            />
          </div>
          <div>
            <Label htmlFor="blog-slug" value={tx('Address (slug)')} />
            <TextInput
              id="blog-slug"
              value={post.slug}
              maxLength={190}
              placeholder="novi-filamenti"
              onChange={(e) => {
                setSlugTouched(true)
                change({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
              }}
            />
          </div>
          <div>
            <Label htmlFor="blog-content" value={tx('Text')} />
            <TextEditor
              key={id}
              id="blog-content"
              headings
              defaultValue={post.content}
              placeholder={tx('The text of the post...')}
              handleEditorChange={(content) => change({ content })}
            />
          </div>
          <div>
            <Label htmlFor="blog-excerpt" value={tx('Excerpt (optional)')} />
            <Textarea
              id="blog-excerpt"
              rows={3}
              maxLength={2000}
              value={post.excerpt}
              onChange={(e) => change({ excerpt: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {tx('A sentence or two shown in the list of posts; without it WordPress takes the start of the text.')}
            </p>
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{tx('Status')}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge color={published ? 'success' : 'gray'}>{tx(published ? 'Published' : saved ? 'Draft' : 'Not saved yet')}</Badge>
              {published && saved?.link && (
                <a href={saved.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-purple-600 underline dark:text-purple-300">
                  {tx('View on the blog')} <HiExternalLink />
                </a>
              )}
            </div>
          </div>
          <div>
            <Label value={tx('Featured image')} />
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="mt-1 aspect-video w-full rounded-lg object-cover" data-testid="blog-image" />
            ) : (
              <div className="mt-1 flex aspect-video w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {tx('No picture')}
              </div>
            )}
            <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={upload} />
            <div className="mt-2 flex gap-2">
              <Button size="xs" color="gray" isProcessing={uploading} disabled={uploading} onClick={() => file.current?.click()}>
                {tx(image ? 'Change the picture' : 'Upload a picture')}
              </Button>
              {image && (
                <Button
                  size="xs"
                  color="gray"
                  onClick={() => {
                    change({ featuredMedia: null })
                    setImage(null)
                  }}
                >
                  {tx('Remove')}
                </Button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{tx('JPG, PNG, WebP or GIF, at most 8 MB. It goes into the WordPress media library.')}</p>
          </div>
          <Categories value={post.categories} onChange={(categories) => change({ categories })} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {published ? (
          <>
            <Button type="button" disabled={saving} onClick={() => save('publish')}>
              {tx('Save changes')}
            </Button>
            <Button type="button" color="gray" disabled={saving} onClick={() => save('draft')}>
              {tx('Unpublish (back to draft)')}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" color="gray" disabled={saving} onClick={() => save('draft')}>
              {tx('Save draft')}
            </Button>
            <Button type="button" disabled={saving} onClick={() => save('publish')}>
              {tx('Publish')}
            </Button>
          </>
        )}
        <Button color="gray" onClick={onClose}>
          {tx('Back to the list')}
        </Button>
      </div>
    </form>
  )
}

/**
 * The shop's WordPress blog written from the admin: the list of posts, or
 * one post open in the editor (?id=..., ?id=new for a new one).
 */
const Blog = () => {
  const id = useSearchParams().get('id')
  const router = useRouter()
  const open = useCallback(
    (next: string | null) => {
      router.push(next ? `${URLPartsEnum.Blog}?id=${next}` : URLPartsEnum.Blog)
    },
    [router]
  )
  const close = useCallback(() => open(null), [open])

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{tx('Blog')}</h2>
        <p className="mt-2 max-w-3xl text-gray-500 dark:text-gray-400">
          {tx('The posts of the WordPress blog (blog.3dpartshop.com), written here: a draft stays hidden, a published post is on the blog and in the Blog section of the home page.')}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        {id ? (
          <Editor
            key={id === 'new' ? 'new' : 'edit'}
            id={id}
            onClose={close}
            onSaved={(saved) => saved !== id && router.replace(`${URLPartsEnum.Blog}?id=${saved}`)}
          />
        ) : (
          <List onOpen={open} />
        )}
      </div>
    </div>
  )
}

export default Blog
