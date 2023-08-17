/* eslint-disable no-unused-vars */
export enum URLPart {
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
}

export enum Errors {
  Unauthorized = "UNAUTHORIZED_ERROR",
}

export enum ErrorCode {
  Unauthorized = 401,
}
