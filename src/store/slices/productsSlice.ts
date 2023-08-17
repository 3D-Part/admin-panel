import { StateCreator } from "zustand";
import { PaginationData, ProductData, ProductFormBody } from "@/shared/types";
import { ProductsAPI } from "@/services";

export interface ProductsSliceInterface {
  activeProduct: ProductData;
  allProducts: ProductData[];
  currentPageProducts: ProductData[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  changeCurrentPage: (data: number) => void;
  changeItemsPerPage: (data: number) => void;
  changeActiveProduct: (product: ProductData) => void;
  fetchProducts: (paginationData?: PaginationData) => Promise<boolean>;
  fetchAllProducts: (paginationData?: PaginationData) => Promise<boolean>;
  addNewProducts: (attribute: ProductFormBody) => Promise<boolean>;
  editProduct: (
    productID: string,
    product: ProductFormBody
  ) => Promise<boolean>;
}

export const productsSlice: StateCreator<ProductsSliceInterface> = (
  set,
  get
) => ({
  activeProduct: {} as ProductData,
  allProducts: [],
  currentPageProducts: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,

  changeCurrentPage: (data: number) => {
    set({ currentPage: data });
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data });
  },

  changeActiveProduct: (product: ProductData) => {
    set({ activeProduct: product });
  },

  fetchProducts: async (paginationData?: PaginationData) => {
    try {
      const data = await ProductsAPI.getProducts(paginationData);
      if (data) {
        set({ currentPageProducts: data.rows });
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) });
      }

      return true;
    } catch (error) {
      console.error("Greška pri dohvatu podataka:", error);
    }
    return false;
  },

  fetchAllProducts: async () => {
    try {
      const data = await ProductsAPI.getProducts();
      if (data) {
        set({ allProducts: data.rows });
      }
      return true;
    } catch (error) {
      console.error("Greška pri dohvatu podataka:", error);
    }
    return false;
  },

  addNewProducts: async (product: ProductFormBody) => {
    // const products = get().allProducts;

    const _productData: ProductFormBody = {
      name: product.name,
      description: product.description,
      details: product.details,
      isPublished: product.isPublished,
      isMostSold: product.isMostSold,
      isRecommended: product.isRecommended,
      sku: product.sku,
      categoryId: product.categoryId,
      manufacturerId: product.manufacturerId,
      price: product.price,
      weight: product.weight,
      quantity: product.quantity,
    };

    try {
      const data = await ProductsAPI.addNewProduct(_productData);
      if (data) {
        // products.push(data);
        // set({ allProducts: [...products] });
        set({ activeProduct: data });
        return true;
      }
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
    return false;
  },

  editProduct: async (productId: string, product: ProductFormBody) => {
    // const products = get().allProducts;

    const _productData: ProductFormBody = {
      name: product.name,
      description: product.description,
      details: product.details,
      isPublished: product.isPublished,
      isMostSold: product.isMostSold,
      isRecommended: product.isRecommended,
      sku: product.sku,
      categoryId: product.categoryId,
      manufacturerId: product.manufacturerId,
      price: product.price,
      weight: product.weight,
      quantity: product.quantity,
    };

    try {
      const data = await ProductsAPI.editProducts(productId, _productData);
      if (data) {
        // const index = products.findIndex((product) => product.id === productId);
        // if (index !== -1) {
        //   products[index] = data;
        // }

        set({ activeProduct: data });
        return true;
      }
    } catch (error) {
      console.error("Error editing product:", error);
      throw error;
    }
    return false;
  },
});
