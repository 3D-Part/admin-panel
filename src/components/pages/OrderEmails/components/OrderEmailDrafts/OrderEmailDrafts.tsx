'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { BackofficeAPI } from '@/services'
import { OrderEmailsFilter } from '@/services/backoffice'
import TextEditor from '@/components/common/TextEditor'
import { Button, Label, Modal, Radio, Select, TextInput } from 'flowbite-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { HiCheck, HiOutlineClipboardCopy, HiOutlineExternalLink } from 'react-icons/hi'
import {
  MailTarget,
  NewsletterContent,
  buildNewsletterHtml,
  buildNewsletterText,
  chunkEmails,
  composeUrl,
  copyHtml,
} from '@/shared/helpers/newsletterDrafts'
import { URLPartsEnum } from '@/shared/enums'
import { useShopSettingsStore } from '@/store/store'

type Props = {
  isOpen: boolean
  onClose: () => void
  // what is typed in the search of the list, offered as the filter
  search: string
}

type Customer = { email: string; name: string; orders: number; lastOrder: string }
type Saved = { drafts: number; recipients: number; draftsFolder: string; perDraft: number }
type Target = MailTarget | 'mailbox'

const EMPTY: NewsletterContent = { subject: '', headline: '', body: '', buttonLabel: '', buttonUrl: '' }
const TARGET_KEY = 'orderEmails.target'

const remembered = (key: string, fallback: string) => {
  try {
    return window.localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}
const remember = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // the choice lasts until the window is closed
  }
}

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

/**
 * One e-mail to the customers who ordered: everyone, a filtered part or the
 * ones ticked by hand. The shop never sends it. It opens ready e-mails in
 * Gmail, Outlook or the mail program (the customers in Bcc, split into groups),
 * or gives the subject, the text and the addresses of each group to copy; with
 * an IMAP mailbox set up it can also put them into its Drafts folder.
 */
export const OrderEmailDrafts: React.FC<Props> = ({ isOpen, onClose, search }) => {
  const [content, setContent] = useState<NewsletterContent>(EMPTY)
  const [audience, setAudience] = useState<'all' | 'filtered' | 'picked'>('all')
  const [filter, setFilter] = useState<OrderEmailsFilter>({ search: '', from: '', to: '' })
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [pickSearch, setPickSearch] = useState('')
  const [pickList, setPickList] = useState<Customer[] | null>(null)
  const [target, setTarget] = useState<Target>('gmail')
  const [size, setSize] = useState(50)
  const [groups, setGroups] = useState<string[][] | null>(null)
  const [done, setDone] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Saved | null>(null)
  const [loading, setLoading] = useState(false)
  const { getShopSettings } = useShopSettingsStore()
  // the IMAP way only when a mailbox with a password is set up (Settings → Order e-mails mailbox)
  const [hasMailbox, setHasMailbox] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSaved(null)
    setGroups(null)
    setDone({})
    setFilter((prev) => ({ ...prev, search }))
    setAudience(search ? 'filtered' : 'all')
    setTarget(remembered(TARGET_KEY, 'gmail') as Target)
    // the group size is "Recipients per draft" of Settings → Order e-mails mailbox
    getShopSettings().then((data: any) => {
      const mailbox = data?.settings?.orderMailbox
      const perDraft = Number(mailbox?.perDraft)
      setSize(perDraft >= 1 ? Math.min(500, perDraft) : 50)
      const ready = !!(mailbox?.host && mailbox?.user && mailbox?.hasPassword)
      setHasMailbox(ready)
      if (!ready) setTarget((prev) => (prev === 'mailbox' ? 'gmail' : prev))
    })
  }, [isOpen, search, getShopSettings])

  const active: OrderEmailsFilter = useMemo(
    () =>
      audience === 'filtered'
        ? {
            ...(filter.search?.trim() && { search: filter.search.trim() }),
            ...(filter.from && { from: filter.from }),
            ...(filter.to && { to: filter.to }),
          }
        : {},
    [audience, filter]
  )

  // who gets it (all or the filtered part), while the filter is typed
  useEffect(() => {
    if (!isOpen || audience === 'picked') return
    setCustomers(null)
    const timer = setTimeout(async () => {
      setCustomers((await BackofficeAPI.listOrderEmails(active)) ?? [])
    }, 300)
    return () => clearTimeout(timer)
  }, [isOpen, audience, active])

  // the customers to tick by hand, by address or name
  useEffect(() => {
    if (!isOpen || audience !== 'picked') return
    const timer = setTimeout(async () => {
      setPickList(
        (await BackofficeAPI.listOrderEmails(pickSearch.trim() ? { search: pickSearch.trim() } : {})) ?? []
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [isOpen, audience, pickSearch])

  // the addresses come lower-case, valid and once each from the server
  const recipients = audience === 'picked' ? picked : (customers ?? []).map((customer) => customer.email)
  const counting = audience !== 'picked' && customers === null

  const html = useMemo(() => buildNewsletterHtml(content), [content])
  const text = useMemo(() => buildNewsletterText(content), [content])
  const set = (key: keyof NewsletterContent) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContent((prev) => ({ ...prev, [key]: e.target.value }))
  const bodyEmpty = !content.body.replace(/<[^>]+>/g, '').trim()
  const ready = !!content.subject.trim() && !bodyEmpty && recipients.length > 0
  const perMail = Math.min(500, Math.max(1, size || 50))

  const togglePicked = (email: string) =>
    setPicked((prev) => (prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]))
  const pickAllShown = () =>
    setPicked((prev) => Array.from(new Set([...prev, ...(pickList ?? []).map((customer) => customer.email)])))

  const create = async () => {
    if (target === 'mailbox') {
      setLoading(true)
      const { data, error } = await BackofficeAPI.createOrderEmailDrafts({
        ...active,
        ...(audience === 'picked' && { emails: picked }),
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
      return
    }
    setSaved(null)
    setDone({})
    setGroups(chunkEmails(recipients, perMail))
  }

  // the designed text goes to the clipboard (Ctrl+V in the e-mail), the rest is filled in
  const openGroup = async (index: number) => {
    if (!groups || target === 'mailbox') return
    // the copy starts while this page has the focus, the window opens in the
    // same click (a browser blocks a window opened after waiting)
    const copying = copyHtml(html, text)
    window.open(composeUrl(target, groups[index], content.subject.trim(), ''), '_blank')
    setDone((prev) => ({ ...prev, [index]: true }))
    if (await copying) toast(tx('Text copied: press Ctrl+V in the e-mail'), { autoClose: 3000, hideProgressBar: true })
  }

  const copyGroup = async (index: number) => {
    if (!groups) return
    const ok = await copyText(groups[index].join(', '))
    toast(ok ? tx('Addresses copied: paste them into Bcc') : tx('Could not copy'), {
      type: ok ? 'success' : 'error',
      autoClose: 2500,
      hideProgressBar: true,
    })
    if (ok) setDone((prev) => ({ ...prev, [index]: true }))
  }

  const copySubject = async () => {
    const ok = await copyText(content.subject.trim())
    toast(ok ? tx('Subject copied') : tx('Could not copy'), { type: ok ? 'success' : 'error', autoClose: 2000, hideProgressBar: true })
  }
  const copyBody = async () => {
    const ok = await copyHtml(html, text)
    toast(ok ? tx('Text copied: press Ctrl+V in the e-mail') : tx('Could not copy'), {
      type: ok ? 'success' : 'error',
      autoClose: 2500,
      hideProgressBar: true,
    })
  }

  const doneCount = Object.values(done).filter(Boolean).length

  return (
    <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="6xl">
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
              <label className="flex items-center gap-2">
                <Radio checked={audience === 'picked'} onChange={() => setAudience('picked')} />
                {tx('Pick customers')}
              </label>
            </div>

            {audience === 'filtered' && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="oe-search" value={tx('Address or name contains')} />
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

            {audience === 'picked' && (
              <div className="rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                <TextInput
                  id="oe-pick-search"
                  sizing="sm"
                  placeholder={tx('Search by address or name')}
                  value={pickSearch}
                  onChange={(e) => setPickSearch(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <Button size="xs" color="light" onClick={pickAllShown} disabled={!pickList?.length}>
                    {tx('Tick all shown ({count})', { count: pickList?.length ?? 0 })}
                  </Button>
                  {picked.length > 0 && (
                    <Button size="xs" color="light" onClick={() => setPicked([])}>
                      {tx('Untick all')}
                    </Button>
                  )}
                </div>
                <ul className="mt-2 max-h-64 overflow-y-auto" data-testid="oe-pick-list">
                  {pickList === null && <li className="p-2 text-sm text-gray-500">{tx('Loading...')}</li>}
                  {pickList?.length === 0 && <li className="p-2 text-sm text-gray-500">{tx('No customer matches')}</li>}
                  {pickList?.map((customer) => (
                    <li key={customer.email}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={picked.includes(customer.email)}
                          onChange={() => togglePicked(customer.email)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-gray-900 dark:text-white">
                            {customer.name || customer.email}
                          </span>
                          {customer.name && (
                            <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{customer.email}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {tx('{count} orders', { count: customer.orders })} ·{' '}
                          {new Date(customer.lastOrder).toLocaleDateString('de-DE')}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="oe-count">
              {counting ? tx('Counting...') : tx('{count} customers get the e-mail', { count: recipients.length })}
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
                className="h-72 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="oe-target" value={tx('Open in')} />
                <Select
                  id="oe-target"
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value as Target)
                    remember(TARGET_KEY, e.target.value)
                    setGroups(null)
                    setSaved(null)
                  }}
                  className="mt-1"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook</option>
                  <option value="default">{tx('Default mail app')}</option>
                  {hasMailbox && (
                    <option value="mailbox">{tx('Straight into the mailbox (Drafts, needs IMAP)')}</option>
                  )}
                </Select>
              </div>
              {target !== 'mailbox' && (
                <div>
                  <Label htmlFor="oe-size" value={tx('Customers per e-mail')} />
                  <TextInput
                    id="oe-size"
                    type="number"
                    min={1}
                    max={500}
                    value={size}
                    onChange={(e) => {
                      setSize(+e.target.value)
                      setGroups(null)
                    }}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {target === 'mailbox' ? (
                <>
                  {tx('The e-mail goes as drafts into the Drafts folder of the mailbox set in Settings → Order e-mails mailbox, each draft with at most the set number of customers in Bcc, so they do not see each other. A colleague opens the drafts in the mail program and sends them one by one.')}{' '}
                  <a className="underline" href={`${URLPartsEnum.SettingsGeneral}?tab=order-mail`}>
                    {tx('Mailbox settings')}
                  </a>
                </>
              ) : (
                tx('Nothing is sent by the shop. Each group opens as a ready e-mail with its customers in Bcc (they do not see each other) and the subject filled in; the designed text is copied, press Ctrl+V in the e-mail, then send. You can also copy the addresses, the subject and the text by hand.')
              )}
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

            {groups && (
              <div className="space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700" data-testid="oe-groups">
                <div className="flex flex-wrap gap-2">
                  <Button size="xs" color="light" onClick={copySubject}>
                    <HiOutlineClipboardCopy className="mr-1 h-4 w-4" />
                    {tx('Copy subject')}
                  </Button>
                  <Button size="xs" color="light" onClick={copyBody}>
                    <HiOutlineClipboardCopy className="mr-1 h-4 w-4" />
                    {tx('Copy text')}
                  </Button>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {tx('{count} e-mails, {done} done', { count: groups.length, done: doneCount })}
                </p>
                <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                  {groups.map((group, i) => (
                    <li
                      key={i}
                      className={`flex flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 text-sm ${
                        done[i]
                          ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/30'
                          : 'border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800'
                      }`}
                    >
                      <label className="flex flex-1 items-center gap-2 text-gray-900 dark:text-white" title={tx('Mark as sent')}>
                        <input
                          type="checkbox"
                          checked={!!done[i]}
                          onChange={() => setDone((prev) => ({ ...prev, [i]: !prev[i] }))}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        {tx('E-mail {number}', { number: i + 1 })}{' '}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({tx('{count} customers', { count: group.length })})
                        </span>
                        {done[i] && <HiCheck className="h-4 w-4 text-green-600" />}
                      </label>
                      <Button size="xs" color="purple" onClick={() => openGroup(i)}>
                        <HiOutlineExternalLink className="mr-1 h-4 w-4" />
                        {tx('Open')}
                      </Button>
                      <Button size="xs" color="light" onClick={() => copyGroup(i)}>
                        <HiOutlineClipboardCopy className="mr-1 h-4 w-4" />
                        {tx('Copy addresses')}
                      </Button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tx('A group ticked green is done; open or copy the next one. Ticks are lost when the window closes.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
        <Button color="purple" isProcessing={loading} disabled={loading || !ready || counting} onClick={create}>
          {target === 'mailbox'
            ? tx('Save drafts in the mailbox')
            : tx('Create e-mails ({count})', { count: ready ? Math.ceil(recipients.length / perMail) : 0 })}
        </Button>
        <Button color="gray" onClick={onClose}>
          {tx('Close')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default OrderEmailDrafts
