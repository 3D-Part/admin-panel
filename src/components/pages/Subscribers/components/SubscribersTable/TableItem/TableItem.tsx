import { CustomerFlagFor } from '@/components/common/CustomerFlag/CustomerFlag'
import { Subscriber } from '@/shared/types'
import { Badge, Checkbox, Table } from 'flowbite-react'
import { tx } from '@/shared/i18n'
import React from 'react'

type TableItemType = {
  subscriber: Subscriber
  checked: boolean
  onToggle: () => void
}

export const TableItem: React.FC<TableItemType> = ({ subscriber, checked, onToggle }) => {
  const { email } = subscriber

  return (
    <>
      <Table.Row className="table-row">
        <Table.Cell className="w-10">
          <Checkbox checked={checked} onChange={onToggle} aria-label={email} />
        </Table.Cell>
        <Table.Cell className="cursor-pointer whitespace-nowrap font-medium table-cell">
          <div className="flex justify-start items-center gap-2">
            {email}
            <CustomerFlagFor email={email} />
          </div>
        </Table.Cell>
        <Table.Cell>
          <ZohoStatusBadge subscriber={subscriber} />
        </Table.Cell>
      </Table.Row>
    </>
  )
}

const ZOHO_STATUS: Record<string, { label: string; color: string }> = {
  in_list: { label: 'In the list', color: 'success' },
  pending: { label: 'Waits for confirmation', color: 'warning' },
  unsubscribed: { label: 'Unsubscribed', color: 'gray' },
  error: { label: 'Error', color: 'failure' },
}

/** Where the subscriber stands in the Zoho newsletter list; the error text on hover. */
export const ZohoStatusBadge: React.FC<{ subscriber: Subscriber }> = ({ subscriber }) => {
  const status = subscriber.zohoStatus ? ZOHO_STATUS[subscriber.zohoStatus] : null
  if (!status) return <span className="text-xs text-gray-400">{tx('Not synced')}</span>
  return (
    <span title={subscriber.zohoError ?? undefined} className="inline-flex flex-col items-start gap-1">
      <Badge color={status.color}>{tx(status.label)}</Badge>
      {subscriber.zohoStatus === 'error' && subscriber.zohoError && (
        <span className="max-w-xs truncate text-xs text-red-600 dark:text-red-400">{subscriber.zohoError}</span>
      )}
    </span>
  )
}
