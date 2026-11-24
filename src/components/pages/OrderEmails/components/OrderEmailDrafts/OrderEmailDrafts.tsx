'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { BackofficeAPI } from '@/services'
import { OrderEmailsFilter } from '@/services/backoffice'
import TextEditor from '@/components/common/TextEditor'
import { Button, Label, Modal, Radio, TextInput } from 'flowbite-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { NewsletterContent, buildNewsletterHtml, buildNewsletterText } from '@/shared/helpers/newsletterDrafts'
import { URLPartsEnum } from '@/shared/enums'

type Props = {
  isOpen: boolean
  onClose: () => void
  // what is typed in the search of the list, offered as the filter
  search: string
}

type Saved = { drafts: number; recipients: number; draftsFolder: string; perDraft: number }

const EMPTY: NewsletterContent = { subject: '', headline: '', body: '', buttonLabel: '', buttonUrl: '' }

/**
 * One e-mail to the customers who ordered (all or a filtered part), put by
 * the API into the order e-mails mailbox as drafts of at most N in Bcc.
 */
export const OrderEmailDrafts: React.FC<Props> = ({ isOpen, onClose, search }) => {
  const [content, setContent] = useState<NewsletterContent>(EMPTY)
  const [audience, setAudience] = useState<'all' | 'filtered'>('all')
  const [filter, setFilter] = useState<OrderEmailsFilter>({ search: '', from: '', to: '' })
  const [count, setCount] = useState<number | null>(null)
  const [saved, setSaved] = useState<Saved | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaved(null)
    setFilter((prev) => ({ ...prev, search }))
    setAudience(search ? 'filtered' : 'all')
  }, [isOpen, search])

  const active: OrderEmailsFilter = useMemo(
    () =>
      audience === 'all'
        ? {}
        : {
            ...(filter.search?.trim() && { search: filter.search.trim() }),
            ...(filter.from && { from: filter.from }),
            ...(filter.to && { to: filter.to }),
          },
    [audience, filter]
  )

  // how many customers get it, while the filter is typed
  useEffect(() => {
    if (!isOpen) return
    setCount(null)
    const timer = setTimeout(async () => {
      const data = await BackofficeAPI.countOrderEmails(active)
      setCount(data?.count ?? null)
    }, 300)
    return () => clearTimeout(timer)
  }, [isOpen, active])

  const html = useMemo(() => buildNewsletterHtml(content), [content])
  const text = useMemo(() => buildNewsletterText(content), [content])
  const set = (key: keyof NewsletterContent) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContent((prev) => ({ ...prev, [key]: e.target.value }))
  const bodyEmpty = !content.body.replace(/<[^>]+>/g, '').trim()
  const ready = content.subject.trim() && !bodyEmpty && (count ?? 0) > 0

  const create = async () => {
    setLoading(true)
    const { data, error } = await BackofficeAPI.createOrderEmailDrafts({
      ...active,
      subject: content.subject.trim(),
      html,
      text,
    })
    setLoading(false)
    if (data) {
      setSaved(data)
      toast(tx('{count} drafts saved in the mailbox', { count: data.drafts }), { type: 'success', autoClose: 4000 })
    } else {
      toast(error ? tx(error) : tx('The drafts were not saved'), { type: 'error', autoClose: 6000 })
    }
  }

  return (
    <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="5xl">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">{tx('Write to customers')}</Modal.Header>
      <Modal.Body>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
              <label className="flex items-center gap-2">
                <Radio checked={audience === 'all'} onChange={() => setAudience('all')} />
                {tx('Everyone who ordered')}
              </label>
              <label className="flex items-center gap-2">
                <Radio checked={audience === 'filtered'} onChange={() => setAudience('filtered')} />
                {tx('Only some')}
              </label>
            </div>
            {audience === 'filtered' && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="oe-search" value={tx('Address contains')} />
                  <TextInput
                    id="oe-search"
                    placeholder="@gmail.com"
                    value={filter.search}
                    onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="oe-from" value={tx('Ordered from')} />
                  <TextInput
                    id="oe-from"
                    type="date"
                    value={filter.from}
                    onChange={(e) => setFilter((prev) => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="oe-to" value={tx('Ordered to')} />
                  <TextInput
                    id="oe-to"
                    type="date"
                    value={filter.to}
                    onChange={(e) => setFilter((prev) => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            )}
            <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="oe-count">
              {count === null ? tx('Counting...') : tx('{count} customers get the e-mail', { count })}
            </p>
            <div>
              <Label htmlFor="oe-subject" value={tx('Email Subject')} />
              <TextInput id="oe-subject" value={content.subject} onChange={set('subject')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="oe-headline" value={tx('Email Headline')} />
              <TextInput id="oe-headline" value={content.headline} onChange={set('headline')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="oe-body" value={tx('Text')} />
              <TextEditor
                key={isOpen ? 'open' : 'closed'}
                id="oe-body"
                defaultValue={content.body}
                // the editor puts non-breaking spaces between words, which would not wrap in the mail
                handleEditorChange={(body) => setContent((prev) => ({ ...prev, body: body.replace(/&nbsp;/g, ' ') }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="oe-btn" value={tx('Button label (optional)')} />
                <TextInput id="oe-btn" value={content.buttonLabel} onChange={set('buttonLabel')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="oe-url" value={tx('Button link')} />
                <TextInput
                  id="oe-url"
                  value={content.buttonUrl}
                  onChange={set('buttonUrl')}
                  className="mt-1"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{tx('Preview')}</p>
              <iframe
                title="preview"
                srcDoc={html}
                sandbox=""
                className="h-80 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tx('The e-mail goes as drafts into the Drafts folder of the mailbox set in Settings → Order e-mails mailbox, each draft with at most the set number of customers in Bcc, so they do not see each other. A colleague opens the drafts in the mail program and sends them one by one.')}{' '}
              <a className="underline" href={`${URLPartsEnum.SettingsGeneral}?tab=order-mail`}>
                {tx('Mailbox settings')}
              </a>
            </p>
            {saved && (
              <div
                data-testid="oe-saved"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/30 dark:text-green-100"
              >
                {tx('{drafts} drafts for {recipients} customers (at most {perDraft} per draft) are in the folder "{folder}". Open the mailbox and send them.', {
                  drafts: saved.drafts,
                  recipients: saved.recipients,
                  perDraft: saved.perDraft,
                  folder: saved.draftsFolder,
                })}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <Button color="purple" isProcessing={loading} disabled={loading || !ready} onClick={create}>
          {tx('Save drafts in the mailbox')}
        </Button>
        <Button color="gray" onClick={onClose}>
          {tx('Close')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderEmailDrafts
