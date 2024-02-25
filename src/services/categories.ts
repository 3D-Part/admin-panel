import { API } from "@/shared/helpers";
import {
  CategoryFormBody,
  CategoryData,
  PaginationData,
  CategoriesData,
  SortParamsData,
} from "@/shared/types";

const API_BASE_URL = process.env.API_KEY;

const getCategories = async (
  sortData: SortParamsData,
  paginationData?: PaginationData,
  params = {}
) => {
  const { offset, limit } = paginationData || {};

  const queryParams = new URLSearchParams();

  if (offset !== undefined && limit !== undefined) {
    queryParams.append("offset", offset.toString());
    queryParams.append("limit", limit.toString());
  }

  queryParams.append("sort[order]", sortData.order);
  queryParams.append("sort[field]", sortData.field);

  try {
    const data = await API.get<CategoriesData>(
      `/shop/categories/?${queryParams}`,
      params
    );
    return data;
  } catch (error) {
    console.error("Error fetching categories data:", error);
    return null;
  }
};

const addNewCategory = async (
  body: CategoryFormBody
): Promise<CategoryData | null> => {
  try {
    const data: CategoryData = await API.post(
      `${API_BASE_URL}/shop/categories/`,
      body
    );
    return data;
  } catch (error) {
    console.error("Error adding category:", error);
    return null;
  }
};

const editCategory = async (
  id: string,
  body: CategoryFormBody
): Promise<CategoryData | null> => {
  try {
    const data: CategoryData = await API.patch(
      `${API_BASE_URL}/shop/categories/${id}`,
      body
    );
    return data;
  } catch (error) {
    console.error("Error editing category:", error);
    return null;
  }
};

const removeCategory = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/shop/categories/${id}`);
    return true;
  } catch (error) {
    console.error("Error removing category:", error);
    return false;
  }
};

const CategoriesAPI = {
  getCategories,
  addNewCategory,
  editCategory,
  removeCategory,
};

export default CategoriesAPI;
