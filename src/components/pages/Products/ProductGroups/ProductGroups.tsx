'use client'
import { productCodes } from '@/components/common/ProductCodes/ProductCodes'
import { tx } from '@/shared/i18n'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Checkbox, TextInput } from 'flowbite-react'
import { toast } from 'react-toastify'
import { ProductsAPI } from '@/services'
import { ProductGroupId } from '@/services/products'
import { WarehouseProduct } from '@/shared/types/warehouse'
import { useProductSearch } from '@/shared/hooks/useProductSearch'
import SearchListFooter from '@/components/common/SearchListFooter/SearchListFooter'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

export const PRODUCT_GROUPS: { id: ProductGroupId; title: string; help: string }[] = [
  {
    id: 'published',
    title: 'Published',
    help: 'Products the customers see on the site. A product outside this group is hidden everywhere on the site.',
  },
  {
    id: 'super-offer',
    title: 'Super offer',
    help: 'The "Super ponuda" slider on the home page and its own page on the site.',
  },
  {
    id: 'most-sold',
    title: 'Most sold',
    help: 'The "Najprodavanije" slider on the home page.',
  },
  {
    id: 'cart-recommended',
    title: 'Shopping cart recommended',
    help: 'Suggested in the shopping cart, next to what the customer already picked.',
  },
]

const money = (value: string | number) => `${Number(value).toFixed(2)} KM`

const Row: React.FC<{
  product: WarehouseProduct
  checked: boolean
  onCheck: () => void
  action: React.ReactNode
}> = ({ product, checked, onCheck, action }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
    <Checkbox checked={checked} onChange={onCheck} aria-label={product.name} />
    <div className="min-w-0 flex-1">
      <a
        href={`/products/edit?id=${product.id}`}
        target="_blank"
        rel="noreferrer"
        className="block truncate text-sm font-medium text-gray-900 hover:underline dark:text-white"
      >
        {product.name}
      </a>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <span className="font-mono">{productCodes(product)}</span> · {money(product.price)} · {tx('Stock')}: {product.quantity}
        {!product.isPublished && (
          <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[11px] text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {tx('Not published')}
          </span>
        )}
      </p>
    </div>
    {action}
  </div>
)

/** One side: the group's products, or the products that can be added to it. */
const GroupList: React.FC<{
  group: ProductGroupId
  member: boolean
  canEdit: boolean
  version: number
  onChanged: () => void
}> = ({ group, member, canEdit, version, onChanged }) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  // the group's own list shows right away, the products to add after typing
  const found = useProductSearch(search, member ? 0 : 2, { id: group, member })
  const { reload } = found

  useEffect(() => {
    setSelected([])
  }, [group, search])

  useEffect(() => {
    if (version) reload()
  }, [version, reload])

  const move = async (ids: string[]) => {
    if (!ids.length) return
    setBusy(true)
    const ok = await ProductsAPI.setProductGroup(group, ids, !member)
    setBusy(false)
    if (!ok) {
      toast(tx('The group was not saved'), { type: 'error', autoClose: 3000 })
      return
    }
    toast(
      member
        ? tx('{count} taken out of the group', { count: ids.length })
        : tx('{count} added to the group', { count: ids.length }),
      { type: 'success', autoClose: 2000 }
    )
    setSelected([])
    onChanged()
  }

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const allShown = found.rows.length > 0 && found.rows.every((row) => selected.includes(row.id))

  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {member ? tx('In this group') : tx('Add products')}
          {member && <span className="ml-1 text-purple-600 dark:text-purple-300">({found.count})</span>}
        </h3>
      </div>
      <TextInput
        placeholder={member ? tx('Search in the group') : tx('Name or code of a product to add')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {canEdit && found.rows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Checkbox
              checked={allShown}
              onChange={() => setSelected(allShown ? [] : found.rows.map((row) => row.id))}
            />
            {tx('Select all shown')}
          </label>
          <Button
            size="xs"
            color={member ? 'failure' : 'purple'}
            disabled={!selected.length || busy}
            onClick={() => move(selected)}
          >
            {member
              ? tx('Take out selected ({count})', { count: selected.length })
              : tx('Add selected ({count})', { count: selected.length })}
          </Button>
        </div>
      )}

      {!member && search.trim().length < 2 ? (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {tx('Type at least two letters to find products that are not in the group yet.')}
        </p>
      ) : found.searched && found.count === 0 ? (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {member && !search ? tx('The group is empty.') : tx('No product found')}
        </p>
      ) : null}

      {found.rows.length > 0 && (
        <>
          <div className="mt-3 grid max-h-[60vh] gap-2 overflow-y-auto pr-1" onScroll={found.onScroll}>
            {found.rows.map((product) => (
              <Row
                key={product.id}
                product={product}
                checked={selected.includes(product.id)}
                onCheck={() => toggle(product.id)}
                action={
                  canEdit && (
                    <Button
                      size="xs"
                      color={member ? 'gray' : 'purple'}
                      disabled={busy}
                      onClick={() => move([product.id])}
                    >
                      {member ? tx('Take out') : tx('Add')}
                    </Button>
                  )
                }
              />
            ))}
          </div>
          <SearchListFooter
            shown={found.rows.length}
            count={found.count}
            loading={found.loading}
            hasMore={found.hasMore}
            onMore={found.loadMore}
          />
        </>
      )}
    </div>
  )
}

/**
 * The product groups (published, super offer, most sold, shopping cart
 * recommended) managed like a sale: a list of the products in the group, and
 * a search to put more in.
 */
const ProductGroups = () => {
  const params = useSearchParams()
  const router = useRouter()
  const requested = params.get('group') as ProductGroupId | null
  const group = PRODUCT_GROUPS.find((item) => item.id === requested) ?? PRODUCT_GROUPS[1]
  const [counts, setCounts] = useState<Partial<Record<ProductGroupId, number>>>({})
  const [version, setVersion] = useState(0)
  const { currentUser } = useCurrentUserStore()
  const canEdit = hasPermission(currentUser?.permissions, PermissionEnum.PRODUCT_WRITE, currentUser?.role)

  const loadCounts = useCallback(() => {
    ProductsAPI.getProductGroupCounts().then((data) => data && setCounts(data))
  }, [])
  useEffect(loadCounts, [loadCounts])

  const changed = () => {
    setVersion((value) => value + 1)
    loadCounts()
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{tx('Product groups')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {tx('Which products are published and which show in the sliders of the site. Put products into a group or take them out here, one by one or many at once.')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRODUCT_GROUPS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => router.replace(`?group=${item.id}`)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              item.id === group.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tx(item.title)}
            {counts[item.id] !== undefined && <span className="ml-1 opacity-80">({counts[item.id]})</span>}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{tx(group.help)}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <GroupList key={`${group.id}-in`} group={group.id} member canEdit={canEdit} version={version} onChanged={changed} />
        {canEdit && (
          <GroupList key={`${group.id}-out`} group={group.id} member={false} canEdit={canEdit} version={version} onChanged={changed} />
        )}
      </div>
    </div>
  )
}

export default ProductGroups
