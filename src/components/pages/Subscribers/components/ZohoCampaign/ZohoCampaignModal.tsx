'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { BackofficeAPI } from '@/services'
import { ZohoCampaign, ZohoStatus } from '@/services/backoffice'
import { Badge, Button, Label, Modal, Select, Textarea, TextInput } from 'flowbite-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { NewsletterContent, buildNewsletterHtml } from '@/shared/helpers/newsletterDrafts'
import { useCurrentUserStore } from '@/store/store'

const EMPTY: NewsletterContent = { subject: '', headline: '', body: '', buttonLabel: '', buttonUrl: '' }

const STATUS_COLOR: Record<ZohoCampaign['status'], string> = {
  draft: 'gray',
  created: 'info',
  sending: 'info',
  sent: 'success',
  failed: 'failure',
}
const STATUS_LABEL: Record<ZohoCampaign['status'], string> = {
  draft: 'Draft',
  created: 'In Zoho, not sent',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
}

const day = (value: string | null) => (value ? new Date(value).toLocaleString('de-DE') : '')

/**
 * A newsletter campaign through Zoho Campaigns: written here, created in
 * Zoho for the newsletter list, and sent right away or left in Zoho to send
 * a test mail, check it and schedule it there.
 */
export const ZohoCampaignModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<NewsletterContent>(EMPTY)
  const [status, setStatus] = useState<ZohoStatus | null>(null)
  const [campaigns, setCampaigns] = useState<ZohoCampaign[]>([])
  const [busy, setBusy] = useState<'create' | 'send' | string | null>(null)
  const [confirmSend, setConfirmSend] = useState(false)
  const [fromEmail, setFromEmail] = useState('')
  const { currentUser } = useCurrentUserStore()
  const [testEmail, setTestEmail] = useState('')
  const [audience, setAudience] = useState<number | null>(null)

  const load = () => {
    BackofficeAPI.getZohoStatus().then(({ data }) => {
      setStatus(data)
      setFromEmail((current) => current || data?.fromEmail || '')
    })
    BackofficeAPI.getZohoCampaigns().then(({ data }) => setCampaigns(data ?? []))
  }

  useEffect(() => {
    if (!isOpen) return
    setContent(EMPTY)
    setConfirmSend(false)
    setTestEmail((current) => current || currentUser?.email || '')
    load()
  }, [isOpen])

  const html = useMemo(() => buildNewsletterHtml(content), [content])
  const set = (key: keyof NewsletterContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setContent((prev) => ({ ...prev, [key]: e.target.value }))

  const list = status?.lists.find((item) => item.listKey === status.listKey)
  // the headline is optional: without it the subject is the mail's heading
  const ready = !!(content.subject.trim() && content.body.trim())
  const connected = !!status?.connected && !!status.listKey

  // a test goes only to the test list in Zoho; "send to everyone" asks first
  // with the real number of people on the list
  const sendTest = async () => {
    setBusy('test')
    const { data, error } = await BackofficeAPI.createZohoCampaign({
      subject: content.subject.trim(),
      html,
      send: true,
      test: true,
      testEmail: testEmail.trim(),
      fromEmail: fromEmail || undefined,
    })
    setBusy(null)
    if (!data) {
      if (!error) toast(tx('The test was not sent'), { type: 'error', autoClose: 7000 })
    } else {
      toast(tx('The test is on its way to {email}', { email: testEmail.trim() }), { type: 'success', autoClose: 5000 })
    }
    load()
  }

  const askSend = async () => {
    setBusy('count')
    const { data } = await BackofficeAPI.getZohoActiveCount()
    setBusy(null)
    setAudience(data?.count ?? null)
    setConfirmSend(true)
  }

  const sendAll = async () => {
    if (busy) return
    setBusy('send')
    const { data, error } = await BackofficeAPI.createZohoCampaign({
      subject: content.subject.trim(),
      html,
      send: true,
      fromEmail: fromEmail || undefined,
    })
    setBusy(null)
    setConfirmSend(false)
    if (!data) {
      if (!error) toast(tx('The campaign was not sent'), { type: 'error', autoClose: 7000 })
      load()
      return
    }
    toast(tx('The campaign is being sent through Zoho'), { type: 'success', autoClose: 4000 })
    setContent(EMPTY)
    load()
  }

  const sendExisting = async (id: string) => {
    setBusy(id)
    const { data, error } = await BackofficeAPI.sendZohoCampaign(id)
    setBusy(null)
    if (!data) {
      if (!error) toast(tx('The campaign was not sent'), { type: 'error', autoClose: 6000 })
    } else toast(tx('The campaign is being sent through Zoho'), { type: 'success', autoClose: 4000 })
    load()
  }

  return (
    <Modal root={modalRoot()} dismissible show={isOpen} onClose={onClose} size="5xl">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">{tx('New newsletter campaign')}</Modal.Header>
      <Modal.Body>
        {status && !connected && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
            {tx('Zoho Campaigns is not connected yet. Connect it in Settings → Zoho Campaigns.')}
          </div>
        )}
        {status?.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {tx(status.error)}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {tx('Goes to the Zoho list')}: <strong>{list?.listName ?? status?.listName ?? '—'}</strong>
              {list ? ` (${list.contacts})` : ''}
            </p>
            <div>
              <Label htmlFor="zc-from" value={tx('From')} />
              <Select id="zc-from" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} className="mt-1">
                {(status?.verifiedSenders?.length ? status.verifiedSenders : [fromEmail]).filter(Boolean).map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="zc-subject" value={tx('Email Subject')} />
              <TextInput id="zc-subject" value={content.subject} onChange={set('subject')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="zc-headline" value={tx('Email Headline')} />
              <TextInput
                id="zc-headline"
                value={content.headline}
                onChange={set('headline')}
                placeholder={content.subject}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="zc-body" value={tx('Content (text or HTML)')} />
              <Textarea id="zc-body" rows={7} value={content.body} onChange={set('body')} className="mt-1 font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="zc-btn" value={tx('Button label (optional)')} />
                <TextInput id="zc-btn" value={content.buttonLabel} onChange={set('buttonLabel')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="zc-url" value={tx('Button link')} />
                <TextInput id="zc-url" value={content.buttonUrl} onChange={set('buttonUrl')} className="mt-1" placeholder="https://" />
              </div>
            </div>
            <div>
              <Label htmlFor="zc-test" value={tx('Test goes to')} />
              <TextInput id="zc-test" type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} className="mt-1" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tx('"Send a test to me" sends the real mail only to the test list in Zoho, with this address on it. Zoho adds the unsubscribe link itself.')}
            </p>
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
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{tx('Recent campaigns')}</p>
              {campaigns.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{tx('No campaigns yet.')}</p>
              ) : (
                <ul className="max-h-48 divide-y divide-gray-100 overflow-y-auto text-sm dark:divide-gray-700">
                  {campaigns.map((campaign) => (
                    <li key={campaign.id} className="flex items-center gap-2 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900 dark:text-white">{campaign.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {campaign.isTest ? `${tx('Test')} · ` : ''}
                          {day(campaign.sentAt ?? campaign.createdAt)}
                          {campaign.recipients !== null && campaign.recipients !== undefined
                            ? ` · ${tx('{count} recipients', { count: campaign.recipients })}`
                            : ''}
                          {campaign.fromEmail ? ` · ${campaign.fromEmail}` : ''}
                          {campaign.error ? ` · ${campaign.error}` : ''}
                        </p>
                      </div>
                      <Badge color={STATUS_COLOR[campaign.status]}>{tx(STATUS_LABEL[campaign.status])}</Badge>
                      {campaign.status === 'created' && (
                        <Button size="xs" color="purple" disabled={!!busy} onClick={() => sendExisting(campaign.id)}>
                          {tx('Send')}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700">
        <Button
          color="gray"
          isProcessing={busy === 'test'}
          disabled={!ready || !connected || !!busy || !status?.testListKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())}
          title={status?.testListKey ? undefined : tx('Pick the test list in Settings → Zoho Campaigns first')}
          onClick={sendTest}
        >
          {tx('Send a test to me')}
        </Button>
        {confirmSend ? (
          <>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {audience === null
                ? tx('Send to everyone on the list now?')
                : tx('Send to {count} subscribers now?', { count: audience })}
            </span>
            <Button color="failure" isProcessing={busy === 'send'} disabled={!!busy} onClick={sendAll}>
              {tx('Yes, send now')}
            </Button>
            <Button color="gray" disabled={!!busy} onClick={() => setConfirmSend(false)}>
              {tx('No')}
            </Button>
          </>
        ) : (
          <Button color="purple" isProcessing={busy === 'count'} disabled={!ready || !connected || !!busy} onClick={askSend}>
            {tx('Send to everyone')}
          </Button>
        )}
        <Button color="gray" disabled={busy === 'send'} onClick={onClose}>
          {tx('Close')}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ZohoCampaignModal
