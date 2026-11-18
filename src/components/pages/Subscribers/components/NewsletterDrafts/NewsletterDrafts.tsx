'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import SubscribersAPI from '@/services/subscibers'
import { BackofficeAPI } from '@/services'
import { Button, Label, Modal, Radio, Select, Textarea, TextInput } from 'flowbite-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import {
  MailTarget,
  NewsletterContent,
  buildNewsletterHtml,
  buildNewsletterText,
  chunkEmails,
  composeUrl,
  copyHtml,
} from '@/shared/helpers/newsletterDrafts'

type Props = {
  isOpen: boolean
  onClose: () => void
  selected: string[]
  total: number
}

const EMPTY: NewsletterContent = { subject: '', headline: '', body: '', buttonLabel: '', buttonUrl: '' }

export const NewsletterDrafts: React.FC<Props> = ({ isOpen, onClose, selected, total }) => {
  const [content, setContent] = useState<NewsletterContent>(EMPTY)
  const [audience, setAudience] = useState<'all' | 'selected'>('all')
  // 'mailbox': straight into the Drafts folder of the shop's mailbox
  const [target, setTarget] = useState<MailTarget | 'mailbox'>('mailbox')
  const [saved, setSaved] = useState<{ drafts: number; recipients: number; draftsFolder: string } | null>(null)
  const [rich, setRich] = useState(true)
  const [size, setSize] = useState(100)
  const [groups, setGroups] = useState<string[][] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setGroups(null)
      setAudience(selected.length > 0 ? 'selected' : 'all')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const html = useMemo(() => buildNewsletterHtml(content), [content])
  const text = useMemo(() => buildNewsletterText(content), [content])
  const set = (key: keyof NewsletterContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setContent((prev) => ({ ...prev, [key]: e.target.value }))

  const fetchAllEmails = async () => {
    const emails: string[] = []
    const page = 100
    for (let offset = 0; ; offset += page) {
      const data = await SubscribersAPI.getSubscribers(
        { field: 'createdAt', order: 'ASC' },
        { offset, limit: page }
      )
      if (!data) throw new Error('fetch failed')
      emails.push(...data.rows.map((row) => row.email))
      if (emails.length >= data.count || data.rows.length === 0) break
    }
    return emails
  }

  const createDrafts = async () => {
    setLoading(true)
    try {
      const emails = audience === 'selected' ? selected : await fetchAllEmails()
      const unique = Array.from(new Set(emails.filter(Boolean)))
      if (target === 'mailbox') {
        const { data, error } = await BackofficeAPI.createNewsletterDrafts({
          subject: content.subject.trim(),
          html,
          text,
          recipients: unique,
          perDraft: Math.min(100, Math.max(1, size)),
        })
        if (data) {
          setSaved(data)
          toast(tx('{count} drafts saved in the mailbox', { count: data.drafts }), { type: 'success', autoClose: 4000 })
        } else {
          toast(error ? tx(error) : tx('The drafts were not saved'), { type: 'error', autoClose: 6000 })
        }
      } else {
        setGroups(chunkEmails(unique, Math.max(1, size)))
      }
    } catch {
      toast(tx('Could not load the subscribers'), { type: 'error', autoClose: 3000 })
    }
    setLoading(false)
  }

  const openDraft = async (index: number) => {
    if (!groups) return
    if (rich) {
      const ok = await copyHtml(html, text)
      if (ok) toast(tx('Content copied: press Ctrl+V in the message'), { autoClose: 3000, hideProgressBar: true })
    }
    if (target === 'mailbox') return
    window.open(composeUrl(target, groups[index], content.subject, rich ? '' : text), '_blank')
  }

  const openAll = async () => {
    if (!groups) return
    if (rich) await copyHtml(html, text)
    if (target === 'mailbox') return
    groups.forEach((group, i) => {
      window.open(composeUrl(target, group, content.subject, rich ? '' : text), `newsletter-${i}`)
    })
  }

  const recipients = audience === 'selected' ? selected.length : total
  const ready = content.subject.trim() && content.headline.trim() && content.body.trim() && recipients > 0

  return (
    <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        {tx('Create newsletter drafts')}
      </Modal.Header>
      <Modal.Body>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
              <label className="flex items-center gap-2">
                <Radio checked={audience === 'all'} onChange={() => setAudience('all')} />
                {tx('All subscribers')} ({total})
              </label>
              <label className="flex items-center gap-2">
                <Radio
                  checked={audience === 'selected'}
                  disabled={selected.length === 0}
                  onChange={() => setAudience('selected')}
                />
                {tx('Selected')} ({selected.length})
              </label>
            </div>
            <div>
              <Label htmlFor="nl-subject" value={tx('Email Subject')} />
              <TextInput id="nl-subject" value={content.subject} onChange={set('subject')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="nl-headline" value={tx('Email Headline')} />
              <TextInput id="nl-headline" value={content.headline} onChange={set('headline')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="nl-body" value={tx('Content (text or HTML)')} />
              <Textarea id="nl-body" rows={7} value={content.body} onChange={set('body')} className="mt-1 font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nl-btn" value={tx('Button label (optional)')} />
                <TextInput id="nl-btn" value={content.buttonLabel} onChange={set('buttonLabel')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="nl-url" value={tx('Button link')} />
                <TextInput id="nl-url" value={content.buttonUrl} onChange={set('buttonUrl')} className="mt-1" placeholder="https://" />
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
                className="h-72 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nl-target" value={tx('Open in')} />
                <Select
                  id="nl-target"
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value as MailTarget | 'mailbox')
                    setGroups(null)
                    setSaved(null)
                  }}
                  className="mt-1"
                >
                  <option value="mailbox">{tx('Straight into the mailbox (Drafts)')}</option>
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="default">{tx('Default mail app')}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="nl-size" value={tx('Recipients per draft')} />
                <TextInput id="nl-size" type="number" min={1} max={target === 'mailbox' ? 100 : 500} value={size} onChange={(e) => setSize(+e.target.value)} className="mt-1" />
              </div>
            </div>
            {target === 'mailbox' ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {tx('The drafts go into the Drafts folder of the mailbox set in Settings → Newsletter mailbox, with the design as in the preview. The customers are in Bcc, so they do not see each other. Open the drafts in the mail program and send them one by one.')}
              </p>
            ) : (
            <div>
              <Label htmlFor="nl-rich" value={tx('Content in the draft')} />
              <Select id="nl-rich" value={rich ? 'rich' : 'plain'} onChange={(e) => setRich(e.target.value === 'rich')} className="mt-1">
                <option value="rich">{tx('Designed (copied, press Ctrl+V)')}</option>
                <option value="plain">{tx('Plain text (already filled in)')}</option>
              </Select>
            </div>
            )}

            {saved && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/30 dark:text-green-100">
                {tx('{drafts} drafts for {recipients} recipients are in the folder "{folder}". Open the mail program and send them.', {
                  drafts: saved.drafts,
                  recipients: saved.recipients,
                  folder: saved.draftsFolder,
                })}
              </div>
            )}

            {groups && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  {tx('Drafts')}: {groups.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {groups.map((group, i) => (
                    <Button key={i} size="xs" color="gray" onClick={() => openDraft(i)}>
                      {i + 1} ({group.length})
                    </Button>
                  ))}
                </div>
                {groups.length > 1 && (
                  <Button size="xs" className="mt-3" color="purple" onClick={openAll}>
                    {tx('Open all drafts')}
                  </Button>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {tx('If the browser blocks the extra windows, allow pop-ups for this site or open the drafts one by one.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <Button color="purple" isProcessing={loading} disabled={loading || !ready} onClick={createDrafts}>
          {target === 'mailbox' ? tx('Save drafts in the mailbox') : tx('Create drafts')}
          {ready ? ` (${Math.ceil(recipients / Math.max(1, target === 'mailbox' ? Math.min(100, size) : size))})` : ''}
        </Button>
        <Button color="gray" onClick={onClose}>{tx('Cancel')}</Button>
      </Modal.Footer>
    </Modal>
  )
}
