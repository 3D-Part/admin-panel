import {
  promoCodesSlice,
  PromoCodesSliceInterface,
} from './slices/promoCodesSlice'
import { create } from 'zustand'
import { categorySlice, CategorySliceInterface } from './slices/categoriesSlice'

import {
  manufactureSlice,
  ManufactureSliceInterface,
} from './slices/manufacturesSlice'

import {
  attributeSlice,
  AttributesSliceInterface,
} from './slices/attributesSlice'

import { productsSlice, ProductsSliceInterface } from './slices/productsSlice'

import {
  storeManagerSlice,
  StoreManagerSliceInterface,
} from './slices/storeManagerSlice'

import { ordersSlice, OrdersSliceInterface } from './slices/orderSlice'
import {
  ordersEmailsSlice,
  OrdersEmailsSliceInterface,
} from './slices/orderEmailsSlice'
import {
  SubscribersSliceInterface,
  subscribersSlice,
} from './slices/subscribersSlice'

import { UsersSliceInterface, usersSlice } from './slices/usersSlice'
import { UISliceInterface, UISlice } from './slices/uiSlice'
import { SalesSliceInterface, salesSlice } from './slices/salesSlice'

export const useCategoryStore = create<CategorySliceInterface>()((...a) => ({
  ...categorySlice(...a),
}))

export const useManufactureStore = create<ManufactureSliceInterface>()(
  (...a) => ({
    ...manufactureSlice(...a),
  })
)

export const useAttributesStore = create<AttributesSliceInterface>()(
  (...a) => ({
    ...attributeSlice(...a),
  })
)

export const useProductsStore = create<ProductsSliceInterface>()((...a) => ({
  ...productsSlice(...a),
}))

export const useS3ManagerStore = create<StoreManagerSliceInterface>()(
  (...a) => ({
    ...storeManagerSlice(...a),
  })
)

export const useOrdersStore = create<OrdersSliceInterface>()((...a) => ({
  ...ordersSlice(...a),
}))

export const useOrdersEmailsStore = create<OrdersEmailsSliceInterface>()(
  (...a) => ({
    ...ordersEmailsSlice(...a),
  })
)

export const useSubscribersSliceStore = create<SubscribersSliceInterface>()(
  (...a) => ({
    ...subscribersSlice(...a),
  })
)

export const useUsersSliceStore = create<UsersSliceInterface>()((...a) => ({
  ...usersSlice(...a),
}))

export const usePromoCodesSliceStore = create<PromoCodesSliceInterface>()(
  (...a) => ({
    ...promoCodesSlice(...a),
  })
)
export const useSalesSliceStore = create<SalesSliceInterface>()((...a) => ({
  ...salesSlice(...a),
}))

export const useUISliceStore = create<UISliceInterface>()((...a) => ({
  ...UISlice(...a),
}))
