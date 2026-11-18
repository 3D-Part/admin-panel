'use client'
import { tx } from '@/shared/i18n'
import { modalRoot } from '@/shared/helpers/modalRoot'
import { BackofficeAPI } from '@/services'
import { ZohoCampaign, ZohoStatus } from '@/services/backoffice'
import { Badge, Button, Label, Modal, Textarea, TextInput } from 'flowbite-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { NewsletterContent, buildNewsletterHtml } from '@/shared/helpers/newsletterDrafts'

const EMPTY: NewsletterContent = { subject: '', headline: '', body: '', buttonLabel: '', buttonUrl: '' }

const STATUS_COLOR: Record<ZohoCampaign['status'], string> = {
  draft: 'gray',
  created: 'info',
  sent: 'success',
  failed: 'failure',
}
const STATUS_LABEL: Record<ZohoCampaign['status'], string> = {
  draft: 'Draft',
  created: 'In Zoho, not sent',
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

  const load = () => {
    BackofficeAPI.getZohoStatus().then(({ data }) => setStatus(data))
    BackofficeAPI.getZohoCampaigns().then(({ data }) => setCampaigns(data ?? []))
  }

  useEffect(() => {
    if (!isOpen) return
    setContent(EMPTY)
    setConfirmSend(false)
    load()
  }, [isOpen])

  const html = useMemo(() => buildNewsletterHtml(content), [content])
  const set = (key: keyof NewsletterContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setContent((prev) => ({ ...prev, [key]: e.target.value }))

  const list = status?.lists.find((item) => item.listKey === status.listKey)
  const ready = !!(content.subject.trim() && content.headline.trim() && content.body.trim())
  const connected = !!status?.connected && !!status.listKey

  const create = async (send: boolean) => {
    setBusy(send ? 'send' : 'create')
    const { data, error } = await BackofficeAPI.createZohoCampaign({ subject: content.subject.trim(), html, send })
    setBusy(null)
    setConfirmSend(false)
    if (!data) {
      toast(error ? tx(error) : tx('The campaign was not created'), { type: 'error', autoClose: 7000 })
      load()
      return
    }
    toast(
      send ? tx('The campaign is being sent through Zoho') : tx('The campaign is in Zoho Campaigns, not sent yet'),
      { type: 'success', autoClose: 4000 }
    )
    setContent(EMPTY)
    load()
  }

  const sendExisting = async (id: string) => {
    setBusy(id)
    const { data, error } = await BackofficeAPI.sendZohoCampaign(id)
    setBusy(null)
    if (!data) toast(error ? tx(error) : tx('The campaign was not sent'), { type: 'error', autoClose: 6000 })
    else toast(tx('The campaign is being sent through Zoho'), { type: 'success', autoClose: 4000 })
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
              <Label htmlFor="zc-subject" value={tx('Email Subject')} />
              <TextInput id="zc-subject" value={content.subject} onChange={set('subject')} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="zc-headline" value={tx('Email Headline')} />
              <TextInput id="zc-headline" value={content.headline} onChange={set('headline')} className="mt-1" />
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tx('"Create in Zoho" leaves the campaign in Zoho Campaigns without sending: there you can send yourself a test mail, check it and schedule it. Zoho adds the unsubscribe link itself.')}
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
                          {day(campaign.sentAt ?? campaign.createdAt)}
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
        <Button color="gray" isProcessing={busy === 'create'} disabled={!ready || !connected || !!busy} onClick={() => create(false)}>
          {tx('Create in Zoho (do not send)')}
        </Button>
        {confirmSend ? (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {tx('Send to everyone on the list now?')}
            </span>
            <Button color="failure" isProcessing={busy === 'send'} disabled={!!busy} onClick={() => create(true)}>
              {tx('Yes, send now')}
            </Button>
            <Button color="gray" onClick={() => setConfirmSend(false)}>{tx('No')}</Button>
          </>
        ) : (
          <Button color="purple" disabled={!ready || !connected || !!busy} onClick={() => setConfirmSend(true)}>
            {tx('Send now')}
          </Button>
        )}
        <Button color="gray" onClick={onClose}>{tx('Close')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ZohoCampaignModal
