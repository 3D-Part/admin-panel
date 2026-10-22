import { OrdersAPI } from '@/services'
import { OrderFormBody } from '../types'
import { OrderStatusEnum } from '../enums'

const {
  orderAccept,
  orderDecline,
  orderFinish,
  orderShipping,
  orderSetStatus,
} = OrdersAPI

/**
 * Four statuses have side effects on the server (stock, points, e-mails) and
 * keep their own endpoints; every other status is a plain status change.
 */
async function executeOrderAction(
  orderId: string,
  status: string,
  body?: OrderFormBody
) {
  let responseData

  switch (status) {
    case OrderStatusEnum.Accepted:
      responseData = await orderAccept(orderId)
      break
    case OrderStatusEnum.Declined:
      if (body) {
        responseData = await orderDecline(orderId, body)
      }
      break
    case OrderStatusEnum.Shipping:
      responseData = await orderShipping(orderId)
      break
    case OrderStatusEnum.Finished:
      responseData = await orderFinish(orderId)
      break
    default:
      responseData = await orderSetStatus(orderId, status)
  }

  return responseData
}

export default executeOrderAction
