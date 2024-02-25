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
    total: number
}

export interface Order {
    id: string
    orderNumber: string
    fullName: string
    email: string
    phone: string
    city: string
    postCode: string
    street: string
    products: OrderProduct[]
    price: string
    shippingPrice: string
    discount: string
    total: string
    status: string
    createdAt: string
    updatedAt: string
}

export interface OrdersData {
    count: number
    rows: Order[]
}

export interface OrderFormBody {
    message: string
}
