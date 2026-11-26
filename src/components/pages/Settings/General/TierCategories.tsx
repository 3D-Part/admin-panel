'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useMemo, useState } from 'react'
import { Button, Label, TextInput } from 'flowbite-react'
import { HiChevronDown, HiChevronRight, HiTrash, HiX } from 'react-icons/hi'
import { useCategoryStore } from '@/store/store'
import { TierCategoryRow } from '@/shared/helpers/tiers'

type Node = { id: string; name: string; path: string; children: Node[] }

/**
 * The categories one tier gives its discount on, each with its own percent.
 * Without any the tier gives its discount on every product. The categories are
 * ticked in a tree with a search, several at once; a ticked category covers
 * its subcategories.
 */
const TierCategories: React.FC<{
  tierId: string
  value: TierCategoryRow[]
  defaultDiscount: string
  onChange: (value: TierCategoryRow[]) => void
}> = ({ tierId, value, defaultDiscount, onChange }) => {
  const { fetchAllCategories, allCategories } = useCategoryStore()
  const [picking, setPicking] = useState(false)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [allPercent, setAllPercent] = useState('')

  useEffect(() => {
    fetchAllCategories()
  }, [fetchAllCategories])

  // the tree, and "Parent › Child" so two subcategories with the same name can be told apart
  const { roots, byId } = useMemo(() => {
    const nodes = new Map<string, Node>()
    allCategories.forEach((category) =>
      nodes.set(category.id, { id: category.id, name: category.name, path: category.name, children: [] })
    )
    const roots: Node[] = []
    allCategories.forEach((category) => {
      const node = nodes.get(category.id)!
      const parent = category.parentCategoryId ? nodes.get(category.parentCategoryId) : undefined
      if (parent && parent !== node) parent.children.push(node)
      else roots.push(node)
    })
    const sort = (list: Node[]) => {
      list.sort((a, b) => a.name.localeCompare(b.name))
      list.forEach((node) => sort(node.children))
    }
    sort(roots)
    const name = (list: Node[], prefix: string, seen: Set<string>) =>
      list.forEach((node) => {
        if (seen.has(node.id)) return
        seen.add(node.id)
        node.path = prefix ? `${prefix} › ${node.name}` : node.name
        name(node.children, node.path, seen)
      })
    name(roots, '', new Set())
    return { roots, byId: nodes }
  }, [allCategories])

  const chosen = useMemo(() => new Set(value.map((rule) => rule.categoryId)), [value])
  const query = search.trim().toLowerCase()

  // with a search: the categories whose name matches, with their parents to show where they are
  const matches = (node: Node): boolean =>
    !query || node.path.toLowerCase().includes(query) || node.children.some(matches)

  const toggle = (id: string) =>
    chosen.has(id)
      ? onChange(value.filter((rule) => rule.categoryId !== id))
      : onChange([...value, { categoryId: id, discount: allPercent || defaultDiscount }])

  const update = (id: string, discount: string) =>
    onChange(value.map((rule) => (rule.categoryId === id ? { ...rule, discount } : rule)))

  const renderNode = (node: Node, depth: number): React.ReactNode => {
    if (!matches(node)) return null
    const expanded = query ? true : !!open[node.id]
    const ticked = chosen.has(node.id)
    const pickedBelow = !ticked && countPicked(node, chosen) > 0
    return (
      <li key={node.id}>
        <div
          className="flex items-center gap-1.5 rounded px-1 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          style={{ paddingLeft: 4 + depth * 18 }}
        >
          {node.children.length ? (
            <button
              type="button"
              onClick={() => setOpen({ ...open, [node.id]: !expanded })}
              className="flex h-5 w-5 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
              aria-label={expanded ? tx('Collapse') : tx('Expand')}
            >
              {expanded ? <HiChevronDown className="h-4 w-4" /> : <HiChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              checked={ticked}
              onChange={() => toggle(node.id)}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className={ticked ? 'font-semibold' : ''}>{node.name}</span>
            {node.children.length > 0 && (
              <span className="text-xs text-gray-400">
                {ticked
                  ? tx('with all {count} subcategories', { count: countAll(node) })
                  : pickedBelow
                  ? tx('{count} picked inside', { count: countPicked(node, chosen) })
                  : ''}
              </span>
            )}
          </label>
        </div>
        {expanded && node.children.length > 0 && <ul>{node.children.map((child) => renderNode(child, depth + 1))}</ul>}
      </li>
    )
  }

  return (
    <div className="mt-3">
      <Label value={tx('Categories')} />
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {value.length === 0
          ? tx('The tier discount is given on every product. Add categories to give it only on them, each with its own discount.')
          : tx('The tier gives a discount only on these categories and their subcategories, each with its own discount; other products get none. A subcategory with its own row gets its own discount. The discount above then only ranks the tier.')}
      </p>

      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((rule) => (
            <div key={rule.categoryId || 'new'} className="grid grid-cols-[1fr_7rem_auto] items-center gap-2">
              <span className="truncate text-sm text-gray-800 dark:text-gray-200" title={byId.get(rule.categoryId)?.path}>
                {byId.get(rule.categoryId)?.path ?? tx('Pick a category')}
              </span>
              <TextInput
                id={`tier-category-discount-${tierId}-${rule.categoryId}`}
                aria-label={tx('Discount (%)')}
                type="number"
                min="0"
                max="100"
                sizing="sm"
                addon="%"
                value={rule.discount}
                onChange={(e) => update(rule.categoryId, e.target.value)}
              />
              <Button
                color="gray"
                size="xs"
                aria-label={tx('Remove category')}
                title={tx('Remove category')}
                onClick={() => onChange(value.filter((other) => other.categoryId !== rule.categoryId))}
              >
                <HiTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button color={picking ? 'purple' : 'light'} size="xs" onClick={() => setPicking(!picking)}>
          {picking ? tx('Done picking') : tx('Pick categories')}
          {value.length > 0 && <span className="ml-1.5">({value.length})</span>}
        </Button>
        {value.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400">{tx('Same discount for all')}</span>
            <TextInput
              id={`tier-category-all-${tierId}`}
              aria-label={tx('Same discount for all')}
              type="number"
              min="0"
              max="100"
              sizing="sm"
              addon="%"
              className="w-24"
              value={allPercent}
              onChange={(e) => setAllPercent(e.target.value)}
            />
            <Button
              color="light"
              size="xs"
              disabled={allPercent === ''}
              onClick={() => onChange(value.map((rule) => ({ ...rule, discount: allPercent })))}
            >
              {tx('Apply')}
            </Button>
          </div>
        )}
        {value.length > 0 && (
          <Button color="light" size="xs" onClick={() => onChange([])}>
            <HiX className="mr-1 h-3 w-3" />
            {tx('Clear all')}
          </Button>
        )}
      </div>

      {picking && (
        <div className="mt-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
          <TextInput
            id={`tier-category-search-${tierId}`}
            sizing="sm"
            placeholder={tx('Search categories')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <ul className="mt-2 max-h-80 overflow-y-auto">{roots.map((node) => renderNode(node, 0))}</ul>
          {query && !roots.some(matches) && (
            <p className="p-2 text-sm text-gray-500">{tx('No category matches')}</p>
          )}
        </div>
      )}
    </div>
  )
}

const countAll = (node: Node): number =>
  node.children.reduce((sum, child) => sum + 1 + countAll(child), 0)

const countPicked = (node: Node, chosen: Set<string>): number =>
  node.children.reduce((sum, child) => sum + (chosen.has(child.id) ? 1 : 0) + countPicked(child, chosen), 0)

export default TierCategories
