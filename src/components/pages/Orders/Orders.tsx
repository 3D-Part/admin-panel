'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OrdersAPI } from '@/services'
import { Order } from '@/shared/types'
import OrderDetails from './components/OrderDetails'
import { useOrdersStore } from '@/store/store'
import { OrdersTable } from './components/OrdersTable/OrdersTable'
import { OrdersHeader } from './components/OrdersHeader'
import OrderEditor from './components/OrderEditor/OrderEditor'
import { Button } from 'flowbite-react'
import { HiPlus } from 'react-icons/hi'
import { useCurrentUserStore } from '@/store/store'
import { hasPermission } from '@/shared/helpers/permissions'
import { PermissionEnum } from '@/shared/types'

const Orders = () => {
  const params = useSearchParams()
  const router = useRouter()
  const offers = params.get('view') === 'offers'
  // /orders?order=<number> opens that order, e.g. from the analytics tables
  const orderNumber = params.get('order')
  const [linked, setLinked] = useState<Order | null>(null)
  // a proforma for a customer who asked by phone or e-mail
  const [newOffer, setNewOffer] = useState(false)
  const { currentUser } = useCurrentUserStore()
  const canWrite = hasPermission(currentUser?.permissions, PermissionEnum.ORDERS_WRITE, currentUser?.role)

  useEffect(() => {
    if (!orderNumber) {
      setLinked(null)
      return
    }
    let current = true
    OrdersAPI.getOrders(
      { field: 'createdAt', order: 'DESC' },
      { offset: 0, limit: 1 },
      { filters: { orderNumber: { is: orderNumber } } }
    ).then((data) => {
      if (current) setLinked(((data as any)?.rows?.[0] as Order) ?? null)
    })
    return () => {
      current = false
    }
  }, [orderNumber])
  const { changeOffersOnly, changeCurrentPage, changeOrderFilter, orderFilter, fetchOrders, itemsPerPage } =
    useOrdersStore()

  // /orders?customer=<email>&label=<name> narrows the list to one customer
  const customer = params.get('customer')
  const label = params.get('label')
  // and by the name too, when many people ordered under that e-mail
  const nameField = params.get('field')
  const name = params.get('name')
  const byName = name && (nameField === 'fullName' || nameField === 'companyName') ? { [nameField]: { is: name } } : null

  useEffect(() => {
    changeOffersOnly(offers)
    changeCurrentPage(1)
    if (customer || byName) {
      changeOrderFilter({ filters: { ...(customer ? { email: { is: customer } } : {}), ...(byName ?? {}) } })
    } else if ((orderFilter as any)?.filters?.email || (orderFilter as any)?.filters?.fullName || (orderFilter as any)?.filters?.companyName) {
      // a customer filter left from an earlier visit
      changeOrderFilter({})
    }
    fetchOrders({ offset: 0, limit: itemsPerPage })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, customer, nameField, name, changeOffersOnly, changeCurrentPage, changeOrderFilter, fetchOrders, itemsPerPage])

  const clearCustomer = () => {
    changeOrderFilter({})
    router.replace(offers ? '/orders?view=offers' : '/orders')
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {offers && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {tx("Offers")}
            </h2>
            {canWrite && (
              <Button color="purple" onClick={() => setNewOffer(true)}>
                <HiPlus className="mr-2 h-4 w-4" />
                {tx('New offer')}
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tx("Orders you offered to a customer. They hold no stock and do not count in analytics until they are accepted and sent to the customer.")}
          </p>
        </div>
      )}
      {(customer || byName) && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {label || customer}
          </span>
          <button type="button" onClick={clearCustomer} className="text-purple-700 hover:underline dark:text-purple-300">
            {tx('Clear filter')}
          </button>
        </div>
      )}
      <OrdersHeader />
      <OrdersTable />
      {linked && (
        <OrderDetails
          isOpen
          order={linked}
          onClose={() => {
            setLinked(null)
            router.replace(offers ? '/orders?view=offers' : '/orders')
          }}
        />
      )}
      {newOffer && (
        <OrderEditor
          create
          order={{ id: '', orderNumber: '', products: [], discount: 0, shippingPrice: 0, points: 0, status: 'PROFORMA_SENT' } as any}
          onClose={() => setNewOffer(false)}
          onSaved={() => {
            setNewOffer(false)
            fetchOrders({ offset: 0, limit: itemsPerPage })
          }}
        />
      )}
    </div>
  )
}

export default Orders
