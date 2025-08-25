import { StateCreator } from 'zustand'

export type MenuItemType = 'link' | 'text'

export interface MenuItemNode {
  id: string
  type: MenuItemType
  label: string
  url?: string
  children: MenuItemNode[]
}

export interface MenuBuilderSliceInterface {
  menuItems: MenuItemNode[]
  setMenuItems: (items: MenuItemNode[]) => void
  addItem: (
    item: Omit<MenuItemNode, 'children'> & { parentId?: string }
  ) => void
  updateItem: (id: string, updates: Partial<MenuItemNode>) => void
  deleteItem: (id: string) => void
  moveUp: (id: string) => void
  moveDown: (id: string) => void
  indentRight: (id: string) => void
  indentLeft: (id: string) => void
  moveToParent: (id: string, newParentId?: string) => void
}

const findItemById = (
  id: string,
  items: MenuItemNode[]
): MenuItemNode | null => {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children.length > 0) {
      const found = findItemById(id, item.children)
      if (found) return found
    }
  }
  return null
}

const findParentById = (
  id: string,
  items: MenuItemNode[]
): MenuItemNode | null => {
  for (const item of items) {
    if (item.children.some((child) => child.id === id)) return item
    if (item.children.length > 0) {
      const found = findParentById(id, item.children)
      if (found) return found
    }
  }
  return null
}

const updateItemInTree = (
  id: string,
  updates: Partial<MenuItemNode>,
  items: MenuItemNode[]
): MenuItemNode[] => {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, ...updates }
    }
    if (item.children.length > 0) {
      return { ...item, children: updateItemInTree(id, updates, item.children) }
    }
    return item
  })
}

const removeItemFromTree = (
  id: string,
  items: MenuItemNode[]
): MenuItemNode[] => {
  return items.filter((item) => {
    if (item.id === id) return false
    if (item.children.length > 0) {
      item.children = removeItemFromTree(id, item.children)
    }
    return true
  })
}

export const menuBuilderSlice: StateCreator<MenuBuilderSliceInterface> = (
  set,
  get
) => ({
  menuItems: [],
  setMenuItems: (items) => set({ menuItems: items }),
  addItem: (item) =>
    set((state) => {
      const { parentId, ...base } = item
      const newNode: MenuItemNode = { ...base, children: [] }
      if (parentId) {
        return {
          menuItems: updateItemInTree(
            parentId,
            {
              children: [
                ...(findItemById(parentId, state.menuItems)?.children || []),
                newNode,
              ],
            },
            state.menuItems
          ),
        }
      }
      return { menuItems: [...state.menuItems, newNode] }
    }),
  updateItem: (id, updates) =>
    set((state) => ({
      menuItems: updateItemInTree(id, updates, state.menuItems),
    })),
  deleteItem: (id) =>
    set((state) => ({ menuItems: removeItemFromTree(id, state.menuItems) })),
  moveUp: (id) =>
    set((state) => {
      const items = state.menuItems
      const parent = findParentById(id, items)
      if (parent) {
        const siblings = parent.children
        const idx = siblings.findIndex((s) => s.id === id)
        if (idx > 0) {
          const newSiblings: MenuItemNode[] = [...siblings]
          const temp = newSiblings[idx]
          newSiblings[idx] = newSiblings[idx - 1]
          newSiblings[idx - 1] = temp
          return {
            menuItems: updateItemInTree(
              parent.id,
              { children: newSiblings },
              items
            ),
          }
        }
        return { menuItems: items }
      }
      // top-level
      const idx = items.findIndex((s) => s.id === id)
      if (idx > 0) {
        const newTop: MenuItemNode[] = [...items]
        const temp = newTop[idx]
        newTop[idx] = newTop[idx - 1]
        newTop[idx - 1] = temp
        return { menuItems: newTop }
      }
      return { menuItems: items }
    }),
  moveDown: (id) =>
    set((state) => {
      const items = state.menuItems
      const parent = findParentById(id, items)
      if (parent) {
        const siblings = parent.children
        const idx = siblings.findIndex((s) => s.id === id)
        if (idx >= 0 && idx < siblings.length - 1) {
          const newSiblings: MenuItemNode[] = [...siblings]
          const temp = newSiblings[idx]
          newSiblings[idx] = newSiblings[idx + 1]
          newSiblings[idx + 1] = temp
          return {
            menuItems: updateItemInTree(
              parent.id,
              { children: newSiblings },
              items
            ),
          }
        }
        return { menuItems: items }
      }
      // top-level
      const idx = items.findIndex((s) => s.id === id)
      if (idx >= 0 && idx < items.length - 1) {
        const newTop: MenuItemNode[] = [...items]
        const temp = newTop[idx]
        newTop[idx] = newTop[idx + 1]
        newTop[idx + 1] = temp
        return { menuItems: newTop }
      }
      return { menuItems: items }
    }),
  indentRight: (id) =>
    set((state) => {
      const items = state.menuItems
      // find previous sibling in flattened order at top-level or within parent
      const parent = findParentById(id, items)
      if (parent) {
        const siblings = parent.children
        const idx = siblings.findIndex((s) => s.id === id)
        if (idx > 0) {
          const currentItem = siblings[idx]
          const target = siblings[idx - 1]
          // remove current from parent
          const newParentChildren = siblings.filter((s) => s.id !== id)
          let updated = updateItemInTree(
            parent.id,
            { children: newParentChildren },
            items
          )
          // append as child of previous sibling
          updated = updateItemInTree(
            target.id,
            {
              children: [
                ...(findItemById(target.id, updated)?.children || []),
                currentItem,
              ],
            },
            updated
          )
          return { menuItems: updated }
        }
        return { menuItems: items }
      } else {
        // top-level
        const idx = items.findIndex((s) => s.id === id)
        if (idx > 0) {
          const currentItem = items[idx]
          const target = items[idx - 1]
          let newTop = items.filter((s) => s.id !== id)
          // add as child to previous top-level item
          newTop = updateItemInTree(
            target.id,
            {
              children: [
                ...(findItemById(target.id, newTop)?.children || []),
                currentItem,
              ],
            },
            newTop
          )
          return { menuItems: newTop }
        }
        return { menuItems: items }
      }
    }),
  indentLeft: (id) =>
    set((state) => {
      const items = state.menuItems
      const parent = findParentById(id, items)
      if (!parent) return { menuItems: items }
      const grand = findParentById(parent.id, items)
      const current = findItemById(id, items)
      if (!current) return { menuItems: items }
      // remove from current parent
      let updated = updateItemInTree(
        parent.id,
        { children: parent.children.filter((c) => c.id !== id) },
        items
      )
      if (grand) {
        updated = updateItemInTree(
          grand.id,
          {
            children: [
              ...(findItemById(grand.id, updated)?.children || []),
              current,
            ],
          },
          updated
        )
      } else {
        updated = [...updated, current]
      }
      return { menuItems: updated }
    }),
  moveToParent: (id, newParentId) =>
    set((state) => {
      const items = state.menuItems
      const current = findItemById(id, items)
      if (!current) return { menuItems: items }
      // remove current from wherever it is
      let updated = removeItemFromTree(id, items)
      if (newParentId) {
        // add as child to new parent
        updated = updateItemInTree(
          newParentId,
          {
            children: [
              ...(findItemById(newParentId, updated)?.children || []),
              current,
            ],
          },
          updated
        )
      } else {
        // top-level
        updated = [...updated, current]
      }
      return { menuItems: updated }
    }),
})
