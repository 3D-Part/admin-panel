export type NewsletterContent = {
  subject: string
  headline: string
  // plain text or HTML; line breaks are kept when there are no tags
  body: string
  buttonLabel: string
  buttonUrl: string
}

export type MailTarget = 'gmail' | 'outlook' | 'default'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const looksLikeHtml = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value)

/** The branded e-mail layout around the admin's content; inline styles so mail clients keep them. */
export const buildNewsletterHtml = (content: NewsletterContent) => {
  const body = looksLikeHtml(content.body)
    ? content.body
    : escapeHtml(content.body).replace(/\n/g, '<br>')
  const button =
    content.buttonLabel && content.buttonUrl
      ? `<p style="text-align:center;margin:28px 0 8px"><a href="${escapeHtml(content.buttonUrl)}" style="background:#2b7bbf;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:6px;display:inline-block">${escapeHtml(content.buttonLabel)}</a></p>`
      : ''
  return `<div style="background:#f4f4f4;padding:16px;font-family:Arial,Helvetica,sans-serif;color:#222">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden">
<div style="background:#1c1c1c;padding:18px;text-align:center;color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:1px">3D<span style="color:#2b7bbf">PART</span></div>
<div style="padding:28px 24px">
<h1 style="font-size:24px;margin:0 0 16px;text-align:center">${escapeHtml(content.headline)}</h1>
<div style="font-size:15px;line-height:1.6">${body}</div>
${button}
</div>
<div style="padding:16px 24px;background:#fafafa;font-size:12px;color:#777;text-align:center">3DPart · info@3dpartshop.com · +387 65 555 333</div>
</div>
</div>`
}

/** Plain-text version for the compose links, where HTML cannot be prefilled. */
export const buildNewsletterText = (content: NewsletterContent) => {
  const body = looksLikeHtml(content.body)
    ? content.body
        .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/h\d>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim()
    : content.body
  const link = content.buttonLabel && content.buttonUrl ? `\n\n${content.buttonLabel}: ${content.buttonUrl}` : ''
  return `${content.headline}\n\n${body}${link}\n\n3DPart`
}

export const chunkEmails = (emails: string[], size: number) => {
  const groups: string[][] = []
  for (let i = 0; i < emails.length; i += size) groups.push(emails.slice(i, i + size))
  return groups
}

/** Link that opens a compose window with the recipients in BCC. */
export const composeUrl = (target: MailTarget, bcc: string[], subject: string, text?: string) => {
  const list = bcc.join(',')
  const body = text ?? ''
  if (target === 'gmail') {
    return `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(list)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  if (target === 'outlook') {
    return `https://outlook.live.com/mail/0/deeplink/compose?bcc=${encodeURIComponent(list)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return `mailto:?bcc=${encodeURIComponent(list)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Puts the HTML on the clipboard as rich text, so Ctrl+V in the compose window keeps the design. */
export const copyHtml = async (html: string, text: string) => {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ])
    return true
  } catch {
    return false
  }
}
