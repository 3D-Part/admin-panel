// GLOBAL
export interface PaginationData {
  offset?: number
  limit?: number
}

export interface SortParamsData {
  field: string
  order: 'ASC' | 'DESC'
}

// LOGIN
export interface LoginData {
  email: string
  password: string
}

export interface LoginResponseData {
  // auth: string;
  accessToken: string
  refreshToken: string
}

export interface GetNewAccessTokenResponseData {
  accessToken: string
}

// MANUFACTURERS
export interface ManufacturerData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ManufacturesData {
  count: number
  rows: ManufacturerData[]
}

export interface ManufacturerFormBody {
  name: string
}

// ATTRIBUTES
export interface AttributeData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AttributesData {
  count: number
  rows: AttributeData[]
}

export interface AttributeFormBody {
  name: string
}

// PRODUCT ATTRIBUTES
export interface CreateProductAttributeBody {
  productId: string
  attributeId: string
  value: string
}

export interface EditProductAttributeBody {
  value: string
}

// CATEGORIES
export interface ParentCategoryData {
  id: string
  name: string
  slug: string
  parentCategoryId?: string | null
  description: string
  createdAt: string
  updatedAt: string
}

export interface CategoryAttribute {
  id: string
  categoryId: string
  attributeId: string
  createdAt: string
  updatedAt: string
  attribute: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
}
export interface CategoryData {
  id: string
  name: string
  slug: string
  parentCategoryId: string | null
  description: string
  createdAt: string
  updatedAt: string
  category: ParentCategoryData | null
  categoryAttributes: CategoryAttribute[]
}

export interface CategoriesData {
  count: number
  rows: CategoryData[]
}

export interface CategoryFormBody {
  name: string
  slug: string
  description: string
  parentCategoryId?: string | null
}

export interface CategoryAttributeData {
  categoryId: string
  attributeId: string
}

// PRODUCTS
export interface ProductAttribute {
  id: string
  productId: string
  attributeId: string
  value: string
  createdAt: string
  updatedAt: string
  attribute: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
}

export interface ProductCategory {
  id: string
  name: string
}

export interface ProductImages {
  createdAt: string
  id: string
  imageId: string
  isMain: boolean
  productId: string
  updatedAt: string
}
export interface ProductData {
  id: string
  name: string
  description: string
  details: string
  sku: string
  categoryId: string
  manufacturerId: string
  createdAt: string
  weight: number
  quantity: number
  price: number
  updatedAt: string
  category: ProductCategory
  productOnSale: [] // TODO add type
  manufacturer: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  productAttributes: ProductAttribute[]
  images: ProductImages[]
  isPublished: boolean
  isMostSold: boolean
  isRecommended: boolean
}

export interface ProductsData {
  count: number
  rows: ProductData[]
}

export interface ProductFormBody {
  name: string
  description?: string
  details?: string
  isPublished: boolean
  isMostSold: boolean
  isRecommended: boolean
  sku: string
  categoryId: string
  manufacturerId?: string
  price: number
  weight: number
  quantity: number
}

export interface ProductImagesFormBody {
  productId: string
  imageId: string
  isMain: boolean
}

export interface EditProductImageFormBody {
  isMain: boolean
}

// STORE MANAGER
export interface S3FormData {
  url: string
  fields: {
    acl: string
    bucket: string
    'X-Amz-Algorithm': string
    'X-Amz-Credential': string
    'X-Amz-Date': string
    key: string
    Policy: string
    'X-Amz-Signature': string
  }
}

// ORDERS

export interface OrderProduct {
  id: string
  name: string
  sku: string
  quantity: number
  price: string
  total: string
  image: string
}

export interface Order {
  city: string
  code: string | null
  companyName: string
  companyPdv: string
  createdAt: string
  description: string
  discount: string
  email: string
  fullName: string
  id: string
  jib: string
  orderNumber: string
  phone: string
  postCode: string
  price: string
  products: OrderProduct[]
  shippingPrice: string
  status: string
  street: string
  total: string
  updatedAt: string
  userId: string
}

export interface OrdersData {
  count: number
  rows: Order[]
}

export interface OrderFormBody {
  message: string
}

// USERS

export interface User {
  id: string
  fullName: string
  email: string
  password: string
  image: string | null
  role: ''
  provider: string
  phone: string | null
  state: string | null
  city: string | null
  postCode: string | null
  street: string | null
  availablePoints: number
  usedPoints: number
  updatedAt: string
  createdAt: string
  orders: Order[]
}
export interface UsersData {
  count: number
  rows: User[]
}

// SUBSCRIBERS
export interface Subscriber {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}
export interface SubscribersData {
  count: number
  rows: Subscriber[]
}

export interface SubscribersEmailBody {
  subject: string
  headline: string
  content: string
}

// PROMOCODES

export interface PromoCode {
  id: string
  code: string
  discountPercentage: number
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
  userPromotionCode: any[]
}

export interface PromoCodesData {
  count: number
  rows: PromoCode[]
}

export interface PromoCodeFormBody {
  code: string
  startsAt: string
  endsAt: string
  discountPercentage: number
}

export interface UsersToPromoCode {
  userIds: string[]
  promoCodeId: string
  applyToAllUsers: boolean
}

export interface PromoCodeUsers {
  createdAt: string
  id: string
  isRedeemed: boolean
  promoCodeId: string
  updatedAt: string
  userId: string
}

// SALES

export interface ProductOnSale {
  createdAt: string
  discountedPrice: string
  id: string
  product: ProductData
  productId: string
  saleId: string
  updatedAt: string
}
export interface Sale {
  id: string
  name: string
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
  productOnSale: ProductOnSale[]
}

export interface SalesFormData {
  name: string
  startsAt: string
  endsAt: string
}

export interface SaleFormBody {
  name: string
  startsAt: string
  endsAt: string
}

export interface SalesData {
  count: number
  rows: Sale[]
}

// POST product on sale
export interface ProductOnSaleData {
  discountedPrice: number
  productId: string
  saleId: string
}

export type ProductsOnSaleFormData = ProductOnSaleData[]

// PATCH product on sale
export interface PatchProductOnSaleData {
  id: string
  discountedPrice: number
}

export type PatchProductsOnSaleFormData = PatchProductOnSaleData[]

// DELETE product on sale
export type DeleteProductsOnSaleFormData = {
  ids: string[]
}
