import { API } from "@/shared/helpers";
import {
  AttributeData,
  PaginationData,
  AttributesData,
  AttributeFormBody,
  SortParamsData,
} from "@/shared/types";

const API_BASE_URL = process.env.API_KEY;

const getAttributes = async (
  sortData: SortParamsData,
  paginationData?: PaginationData
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
    const data = await API.get<AttributesData>(
      `${API_BASE_URL}/shop/attributes/?${queryParams}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching attributes data:", error);
    return null;
  }
};

const addNewAttribute = async (
  body: AttributeFormBody
): Promise<AttributeData | null> => {
  try {
    const data: AttributeData = await API.post(
      `${API_BASE_URL}/shop/attributes/`,
      body
    );
    return data;
  } catch (error) {
    console.error("Error adding attribute:", error);
    return null;
  }
};

const editAttribute = async (
  id: string,
  body: AttributeFormBody
): Promise<AttributeData | null> => {
  try {
    const data: AttributeData = await API.patch(
      `${API_BASE_URL}/shop/attributes/${id}`,
      body
    );
    return data;
  } catch (error) {
    console.error("Error editing attribute:", error);
    return null;
  }
};

const removeAttribute = async (id: string): Promise<boolean> => {
  try {
    await API.remove(`${API_BASE_URL}/shop/attributes/${id}`);
    return true;
  } catch (error) {
    console.error("Error removing attributes:", error);
    return false;
  }
};

const AttributeAPI = {
  getAttributes,
  addNewAttribute,
  editAttribute,
  removeAttribute,
};

export default AttributeAPI;
