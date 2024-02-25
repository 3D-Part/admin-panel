import { StateCreator } from "zustand";
import {
  PaginationData,
  AttributeData,
  AttributeFormBody,
} from "@/shared/types";
import { AttributeAPI } from "@/services";

export interface AttributesSliceInterface {
  allAttributes: AttributeData[];
  currentPageAttributes: AttributeData[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  sortFiled: string;
  sortOrder: "ASC" | "DESC";
  attributeFilters: {};
  changeCurrentPage: (data: number) => void;
  changeItemsPerPage: (data: number) => void;
  changeAttributeFilter: (data: {}) => void;
  fetchAttributes: (paginationData?: PaginationData) => Promise<boolean>;
  fetchAllAttributes: (paginationData?: PaginationData) => Promise<boolean>;
  addNewAttribute: (attribute: AttributeFormBody) => Promise<boolean>;
  editAttribute: (
    attributeID: string,
    attribute: AttributeFormBody
  ) => Promise<boolean>;
}

export const attributeSlice: StateCreator<AttributesSliceInterface> = (
  set,
  get
) => ({
  allAttributes: [],
  currentPageAttributes: [],
  currentPage: 1,
  itemsPerPage: 15,
  totalPages: 1,
  sortFiled: "createdAt",
  sortOrder: "DESC",
  attributeFilters: {},

  changeCurrentPage: (data: number) => {
    set({ currentPage: data });
  },

  changeItemsPerPage: (data: number) => {
    set({ itemsPerPage: data });
  },

  changeAttributeFilter: (data: {}) => {
    set({ attributeFilters: data });
  },

  fetchAttributes: async (paginationData?: PaginationData) => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    };

    try {
      const data = await AttributeAPI.getAttributes(
        sort,
        paginationData,
        get().attributeFilters
      );
      if (data) {
        set({ currentPageAttributes: data.rows });
        set({ totalPages: Math.ceil(data.count / get().itemsPerPage) });
      }

      return true;
    } catch (error) {
      console.error("Greška pri dohvatu podataka:", error);
    }
    return false;
  },

  fetchAllAttributes: async () => {
    const sort = {
      field: get().sortFiled,
      order: get().sortOrder,
    };

    try {
      const data = await AttributeAPI.getAttributes(sort);
      if (data) {
        set({ allAttributes: data.rows });
      }
      return true;
    } catch (error) {
      console.error("Greška pri dohvatu podataka:", error);
    }
    return false;
  },

  addNewAttribute: async (attribute: AttributeFormBody) => {
    const attributes = get().allAttributes;

    const _attributesData: AttributeFormBody = {
      name: attribute.name,
    };

    try {
      const data = await AttributeAPI.addNewAttribute(_attributesData);
      if (data) {
        attributes.push(data);
        set({ allAttributes: [...attributes] });
        return true;
      }
    } catch (error) {
      console.error("Error adding attribute:", error);
      throw error;
    }
    return false;
  },

  editAttribute: async (attributeId: string, attribute: AttributeFormBody) => {
    const attributes = get().allAttributes;

    const _AttributeData: AttributeFormBody = {
      name: attribute.name,
    };

    try {
      const data = await AttributeAPI.editAttribute(
        attributeId,
        _AttributeData
      );
      if (data) {
        const index = attributes.findIndex(
          (attribute) => attribute.id === attributeId
        );
        if (index !== -1) {
          attributes[index] = data;
        }
        return true;
      }
    } catch (error) {
      console.error("Error editing attribute:", error);
      throw error;
    }
    return false;
  },
});
