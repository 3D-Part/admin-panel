/* eslint-disable no-unused-vars */
export enum URLPartsEnum {
  Login = "/login",

  Categories = "/categories",
  AddNewCategory = "/categories/add-new",

  Products = "/products",
  AddNewProduct = "/products/add-new",
  EditProduct = "/products/edit",

  Manufacturers = "/manufacturers",
  AddNewManufacturer = "/manufacturers/add-new",

  Attributes = "/attributes",
  AddNewAttribute = "/attributes/add-new",

  Orders = "/orders",
}

export enum ErrorsEnum {
  Unauthorized = "UNAUTHORIZED_ERROR",
}

export enum ErrorCodeEnum {
  Unauthorized = 401,
}

export enum OrderStatusEnum {
  Pending = "PENDING",
  Processing = "PROCESSING",
  Shipped = "SHIPPED",
  Cancelled = "CANCELLED",
  Rejected = "REJECTED",
  Refunded = "REFUNDED",
  OnHold = "ONHOLD",
  Delivered = "DELIVERED",
  Completed = "COMPLETED",
}
