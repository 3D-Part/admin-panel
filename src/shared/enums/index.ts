/* eslint-disable no-unused-vars */
export enum URLPartsEnum {
  Login = '/login',
  Verify = '/auth/verify',

  Categories = '/categories',
  AddNewCategory = '/categories/add-new',
  EditCategory = '/categories/edit',

  Products = '/products',
  AddNewProduct = '/products/add-new',
  OutOfStockProducts = '/products/out-of-stock',
  EditProduct = '/products/edit',

  Manufacturers = '/manufacturers',
  AddNewManufacturer = '/manufacturers/add-new',
  EditManufacturer = '/manufacturers/edit',

  Attributes = '/attributes',
  AddNewAttribute = '/attributes/add-new',
  EditAttribute = '/attributes/edit',

  Orders = '/orders',
  OrderEmails = '/orders/emails',

  Users = '/users',

  Subscribers = '/subscribers',
  Guide = '/guide',

  PromoCodes = '/promocodes',
  AddNewPromoCode = '/promocodes/add-new',
  EditPromoCode = '/promocodes/edit',

  Sales = '/sales',
  AddNewSale = '/sales/add-new',
  EditSale = '/sales/edit',

  Employees = '/employees',

  Warehouse = '/warehouse',
  Analytics = '/analytics',
  ActionsNeeded = '/actions-needed',
  Proformas = '/proformas',

  Settings = '/settings',
  SettingsGeneral = '/settings/general',
  SettingsMenu = '/settings/menu',
}

export enum ErrorsEnum {
  Unauthorized = 'UNAUTHORIZED_ERROR',
}

export enum ErrorCodeEnum {
  Unauthorized = 401,
}

export enum OrderStatusEnum {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  ProformaSent = 'PROFORMA_SENT',
  Preparing = 'PREPARING',
  Shipping = 'SHIPPING',
  ReadyForPickup = 'READY_FOR_PICKUP',
  InvoiceIssued = 'INVOICE_ISSUED',
  AwaitingPayment = 'AWAITING_PAYMENT',
  Paid = 'PAID',
  InvoiceSent = 'INVOICE_SENT',
  Finished = 'FINISHED',
  Returned = 'RETURNED',
  Declined = 'DECLINED',
}

/** The four steps of an order, in the order they happen. */
export const ORDER_STEPS: OrderStatusEnum[] = [
  OrderStatusEnum.Accepted,
  OrderStatusEnum.Preparing,
  OrderStatusEnum.Shipping,
  OrderStatusEnum.Finished,
]

/** What the status dropdown offers. Older statuses stay readable on old orders. */
export const ORDER_STATUS_FLOW: OrderStatusEnum[] = [
  OrderStatusEnum.Pending,
  ...ORDER_STEPS,
  OrderStatusEnum.ReadyForPickup,
  OrderStatusEnum.ProformaSent,
  OrderStatusEnum.Returned,
  OrderStatusEnum.Declined,
]

/** The customer gets an email when an order moves to one of these for the first time. */
export const ORDER_STATUS_EMAILS: Partial<Record<OrderStatusEnum, string>> = {
  [OrderStatusEnum.Accepted]: 'A new order: the customer gets an email that it is accepted.',
  [OrderStatusEnum.Shipping]: 'The customer gets an email that the order is on its way, once per order.',
  [OrderStatusEnum.Declined]: 'The customer gets an email with the reason you write below.',
}

