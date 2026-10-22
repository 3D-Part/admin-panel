import React, { useEffect } from 'react'
import { Badge } from 'flowbite-react'
import getOrderStatusStyle from '@/shared/helpers/getOrderStatusStyle'
import getOrderStatusLabel from '@/shared/helpers/getOrderStatusLabel'

type OrderStatusType = {
  status: string
}

const OrderStatus: React.FC<OrderStatusType> = ({ status }) => {
  const statusStyle = getOrderStatusStyle(status)

  useEffect(() => {}, [statusStyle])

  return (
    <Badge className={`justify-center whitespace-nowrap ${statusStyle}`}>
      {getOrderStatusLabel(status)}
    </Badge>
  )
}

export default OrderStatus
