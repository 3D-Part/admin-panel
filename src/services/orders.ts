import { API } from "@/shared/helpers";
import { OrdersData, SortParamsData, PaginationData } from "@/shared/types";

const API_BASE_URL = process.env.API_KEY;

const getOrders = async (
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
    const data = await API.get<OrdersData>(
      `${API_BASE_URL}/order?${queryParams}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching orders data:", error);
    return null;
  }
};

const OrdersAPI = {
  getOrders,
};

export default OrdersAPI;
