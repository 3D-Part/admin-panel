/* eslint-disable no-unused-vars */
export enum URLPartsEnum {
  Login = '/login',
  Verify = '/auth/verify',

  Categories = '/categories',
  AddNewCategory = '/categories/add-new',
  EditCategory = '/categories/edit',

  Products = '/products',
  AddNewProduct = '/products/add-new',
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

  PromoCodes = '/promocodes',
  AddNewPromoCode = '/promocodes/add-new',
  EditPromoCode = '/promocodes/edit',

  Sales = '/sales',
  AddNewSale = '/sales/add-new',
  EditSale = '/sales/edit',

  Employees = '/employees',

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
  Declined = 'DECLINED',
  Shipping = 'SHIPPING',
  Finished = 'FINISHED',
}
