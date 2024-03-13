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
  SubscribersSliceInterface,
  subscribersSlice,
} from './slices/subscribersSlice'

import { UsersSliceInterface, usersSlice } from './slices/usersSlice'

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
