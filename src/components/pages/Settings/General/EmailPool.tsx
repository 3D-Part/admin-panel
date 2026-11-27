'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { Button, Spinner } from 'flowbite-react'
import { toast } from 'react-toastify'
import { HiCheck, HiOutlineClipboardCopy, HiOutlineRefresh } from 'react-icons/hi'
import { BackofficeAPI } from '@/services'

const GROUP = 100

/**
 * Every e-mail address of the shop once (the registered customers and everyone
 * who ever ordered), in groups of 100 to copy and paste into the CC or Bcc of
 * an e-mail. New addresses join at the end, so the groups already copied stay
 * the same; the marks of the copied groups are kept in this browser.
 */
const EmailPool: React.FC = () => {
  const [emails, setEmails] = useState<string[] | null>(null)
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  const load = async () => {
    setEmails(null)
    const data = await BackofficeAPI.getEmailPool()
    setEmails(data?.emails ?? [])
  }

  useEffect(() => {
    load()
    try {
      setCopied(JSON.parse(window.localStorage.getItem('emailPool.copied') || '{}'))
    } catch {
      // no marks kept in this browser
    }
  }, [])

  // a group is known by its first and last address, so it stays marked while new ones join after it
  const keyOf = (group: string[]) => `${group[0]}|${group[group.length - 1]}|${group.length}`

  const mark = (key: string, value: boolean) => {
    const next = { ...copied, [key]: value }
    setCopied(next)
    try {
      window.localStorage.setItem('emailPool.copied', JSON.stringify(next))
    } catch {
      // the marks last until the page is left
    }
  }

  const copy = async (group: string[]) => {
    try {
      await navigator.clipboard.writeText(group.join(', '))
      toast(tx('{count} addresses copied: paste them into CC or Bcc', { count: group.length }), {
        type: 'success',
        autoClose: 2500,
        hideProgressBar: true,
      })
      mark(keyOf(group), true)
    } catch {
      toast(tx('Could not copy'), { type: 'error', autoClose: 2500 })
    }
  }

  const groups: string[][] = []
  for (let i = 0; i < (emails?.length ?? 0); i += GROUP) groups.push(emails!.slice(i, i + GROUP))
  const doneCount = groups.filter((group) => copied[keyOf(group)]).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {emails === null
            ? tx('Loading...')
            : tx('{count} addresses in {groups} groups of at most {size}; {done} copied', {
                count: emails.length,
                groups: groups.length,
                size: GROUP,
                done: doneCount,
              })}
        </p>
        <div className="flex gap-2">
          <Button size="xs" color="light" onClick={load} disabled={emails === null}>
            <HiOutlineRefresh className="mr-1 h-4 w-4" />
            {tx('Refresh')}
          </Button>
          {doneCount > 0 && (
            <Button
              size="xs"
              color="light"
              onClick={() => {
                setCopied({})
                try {
                  window.localStorage.removeItem('emailPool.copied')
                } catch {
                  // nothing kept
                }
              }}
            >
              {tx('Clear the marks')}
            </Button>
          )}
        </div>
      </div>

      {emails === null && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      <div className="space-y-3" data-testid="email-pool">
        {groups.map((group, i) => {
          const done = !!copied[keyOf(group)]
          return (
            <div
              key={keyOf(group)}
              className={`rounded-lg border p-3 ${
                done
                  ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {tx('Group {number}', { number: i + 1 })}
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    ({i * GROUP + 1}–{i * GROUP + group.length})
                  </span>
                  {done && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                      <HiCheck className="h-4 w-4" />
                      {tx('Copied')}
                    </span>
                  )}
                </span>
                <div className="flex gap-2">
                  {done && (
                    <Button size="xs" color="light" onClick={() => mark(keyOf(group), false)}>
                      {tx('Unmark')}
                    </Button>
                  )}
                  <Button size="xs" color="purple" onClick={() => copy(group)}>
                    <HiOutlineClipboardCopy className="mr-1 h-4 w-4" />
                    {tx('Copy')}
                  </Button>
                </div>
              </div>
              <textarea
                readOnly
                value={group.join(', ')}
                rows={3}
                onFocus={(e) => e.target.select()}
                className="w-full resize-y rounded-md border border-gray-200 bg-gray-50 p-2 font-mono text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EmailPool
