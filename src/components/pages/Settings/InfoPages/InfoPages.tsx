'use client'
import { tx } from '@/shared/i18n'

import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge, Button, Label, Table, TextInput, Textarea, ToggleSwitch } from 'flowbite-react'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi'
import { toast } from 'react-toastify'
import TextEditor from '@/components/common/TextEditor'
import InfoPagesAPI, { InfoPage, InfoPageInput, infoPageError } from '@/services/infoPages'
import { URLPartsEnum } from '@/shared/enums'

const EMPTY: InfoPageInput = {
  title: '',
  slug: '',
  body: '',
  published: false,
  seoTitle: '',
  seoDescription: '',
  showInFooter: true,
  position: 0,
}

/** "Dostava i plaćanje" -> "dostava-i-placanje", as the API makes it. */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[čćšžđ]/g, (letter) => ({ č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj' })[letter] as string)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

const List: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const [pages, setPages] = useState<InfoPage[] | null>(null)

  const load = useCallback(() => {
    InfoPagesAPI.list()
      .then(setPages)
      .catch(() => {
        setPages([])
        toast(tx('The pages could not be loaded'), { type: 'error', autoClose: 3000 })
      })
  }, [])
  useEffect(load, [load])

  const remove = async (page: InfoPage) => {
    if (!window.confirm(tx('Delete the page "{title}"? Its address stops working on the site.', { title: page.title }))) return
    try {
      await InfoPagesAPI.remove(page.id)
      toast(tx('Page deleted'), { type: 'success', autoClose: 2000 })
      load()
    } catch {
      toast(tx('The page could not be deleted'), { type: 'error', autoClose: 3000 })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => onOpen('new')}>
          <HiPlus className="mr-1 h-4 w-4" /> {tx('New page')}
        </Button>
      </div>
      {pages === null ? (
        <p className="text-gray-500 dark:text-gray-400">{tx('Loading...')}</p>
      ) : pages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          {tx('No pages yet. A page could be e.g. Delivery and payment, Returns or About us.')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>{tx('Title')}</Table.HeadCell>
              <Table.HeadCell>{tx('Address')}</Table.HeadCell>
              <Table.HeadCell>{tx('Status')}</Table.HeadCell>
              <Table.HeadCell>{tx('Footer')}</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">{tx('Actions')}</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pages.map((page) => (
                <Table.Row
                  key={page.id}
                  className="cursor-pointer bg-white dark:border-gray-700 dark:bg-gray-800"
                  onClick={() => onOpen(page.id)}
                >
                  <Table.Cell className="font-medium text-gray-900 dark:text-white">{page.title}</Table.Cell>
                  <Table.Cell>/info/{page.slug}</Table.Cell>
                  <Table.Cell>
                    <div className="flex">
                      <Badge color={page.published ? 'success' : 'gray'}>
                        {tx(page.published ? 'Published' : 'Draft')}
                      </Badge>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{page.showInFooter ? tx('Yes, place {n}', { n: page.position }) : '—'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button size="xs" color="gray" aria-label={tx('Edit')} onClick={() => onOpen(page.id)}>
                        <HiPencil />
                      </Button>
                      <Button size="xs" color="failure" aria-label={tx('Delete')} onClick={() => remove(page)}>
                        <HiTrash />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  )
}

const Editor: React.FC<{ id: string; onClose: () => void; onSaved: (id: string) => void }> = ({
  id,
  onClose,
  onSaved,
}) => {
  const isNew = id === 'new'
  const [page, setPage] = useState<InfoPageInput | null>(isNew ? EMPTY : null)
  // the address follows the title until it is typed by hand
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return
    InfoPagesAPI.get(id)
      .then((data) =>
        setPage({
          title: data.title,
          slug: data.slug,
          body: data.body ?? '',
          published: data.published,
          seoTitle: data.seoTitle ?? '',
          seoDescription: data.seoDescription ?? '',
          showInFooter: data.showInFooter,
          position: data.position,
        })
      )
      .catch(() => {
        toast(tx('The page could not be loaded'), { type: 'error', autoClose: 3000 })
        onClose()
      })
  }, [id, isNew, onClose])

  if (!page) return <p className="text-gray-500 dark:text-gray-400">{tx('Loading...')}</p>

  const change = (patch: Partial<InfoPageInput>) => setPage((current) => ({ ...(current as InfoPageInput), ...patch }))

  const save = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!page.title.trim()) {
      toast(tx('The page needs a title'), { type: 'error', autoClose: 3000 })
      return
    }
    setSaving(true)
    try {
      const body = { ...page, position: Number(page.position) || 0 }
      const saved = isNew ? await InfoPagesAPI.create(body) : await InfoPagesAPI.update(id, body)
      toast(tx('Page saved. The site shows it within a minute.'), { type: 'success', autoClose: 2500 })
      setPage((current) => ({ ...(current as InfoPageInput), slug: saved.slug }))
      onSaved(saved.id)
    } catch (error) {
      toast(tx(infoPageError(error)), { type: 'error', autoClose: 4000 })
    }
    setSaving(false)
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="info-title" value={tx('Title')} />
            <TextInput
              id="info-title"
              value={page.title}
              maxLength={120}
              required
              onChange={(e) =>
                change({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })
              }
            />
          </div>
          <div>
            <Label htmlFor="info-slug" value={tx('Address on the site')} />
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">/info/</span>
              <TextInput
                id="info-slug"
                className="flex-1"
                value={page.slug}
                maxLength={80}
                placeholder="dostava-i-placanje"
                onChange={(e) => {
                  setSlugTouched(true)
                  change({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="info-body" value={tx('Text')} />
            <TextEditor
              key={id}
              id="info-body"
              headings
              defaultValue={page.body}
              placeholder={tx('The text of the page...')}
              handleEditorChange={(body) => change({ body })}
            />
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <ToggleSwitch
            checked={page.published}
            label={tx('Published')}
            onChange={(published) => change({ published })}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {tx('A page that is not published cannot be opened on the site.')}
          </p>
          <ToggleSwitch
            checked={page.showInFooter}
            label={tx('Link in the footer')}
            onChange={(showInFooter) => change({ showInFooter })}
          />
          <div>
            <Label htmlFor="info-position" value={tx('Place in the footer (smaller first)')} />
            <TextInput
              id="info-position"
              type="number"
              min={0}
              max={9999}
              value={page.position}
              onChange={(e) => change({ position: Number(e.target.value) })}
            />
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <div>
            <Label htmlFor="info-seo-title" value={tx('SEO title (optional)')} />
            <TextInput
              id="info-seo-title"
              value={page.seoTitle ?? ''}
              maxLength={120}
              placeholder={page.title}
              onChange={(e) => change({ seoTitle: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="info-seo-description" value={tx('SEO description (optional)')} />
            <Textarea
              id="info-seo-description"
              rows={3}
              maxLength={300}
              value={page.seoDescription ?? ''}
              onChange={(e) => change({ seoDescription: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {tx('What Google shows under the title, about 150 characters.')}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {tx('Save page')}
        </Button>
        <Button color="gray" onClick={onClose}>
          {tx('Back to the list')}
        </Button>
      </div>
    </form>
  )
}

/**
 * Pages of the shop at /info/<slug> that the staff write: the list, or one
 * page open in the editor (?id=..., ?id=new for a new one).
 */
const InfoPages = () => {
  const id = useSearchParams().get('id')
  const router = useRouter()
  const open = useCallback((next: string | null) => {
    router.push(next ? `${URLPartsEnum.SettingsInfoPages}?id=${next}` : URLPartsEnum.SettingsInfoPages)
  }, [router])
  const close = useCallback(() => open(null), [open])

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{tx('Info pages')}</h2>
        <p className="mt-2 max-w-3xl text-gray-500 dark:text-gray-400">
          {tx('Pages of the site such as Delivery and payment or About us, at www.3dpartshop.com/info/<address>. A published page can get a link in the footer of the site.')}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {id ? (
          <Editor
            key={id === 'new' ? 'new' : 'edit'}
            id={id}
            onClose={close}
            onSaved={(saved) => saved !== id && router.replace(`${URLPartsEnum.SettingsInfoPages}?id=${saved}`)}
          />
        ) : (
          <List onOpen={open} />
        )}
      </div>
    </div>
  )
}

export default InfoPages
