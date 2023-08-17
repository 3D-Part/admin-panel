import { create } from "zustand";
import {
  categorySlice,
  CategorySliceInterface,
} from "./slices/categoriesSlice";

import {
  manufactureSlice,
  ManufactureSliceInterface,
} from "./slices/manufacturesSlice";

import {
  attributeSlice,
  AttributesSliceInterface,
} from "./slices/attributesSlice";

import { productsSlice, ProductsSliceInterface } from "./slices/productsSlice";

import {
  storeManagerSlice,
  StoreManagerSliceInterface,
} from "./slices/storeManagerSlice";

export const useCategoryStore = create<CategorySliceInterface>()((...a) => ({
  ...categorySlice(...a),
}));

export const useManufactureStore = create<ManufactureSliceInterface>()(
  (...a) => ({
    ...manufactureSlice(...a),
  })
);

export const useAttributesStore = create<AttributesSliceInterface>()(
  (...a) => ({
    ...attributeSlice(...a),
  })
);

export const useProductsStore = create<ProductsSliceInterface>()((...a) => ({
  ...productsSlice(...a),
}));

export const useS3ManagerStore = create<StoreManagerSliceInterface>()(
  (...a) => ({
    ...storeManagerSlice(...a),
  })
);
