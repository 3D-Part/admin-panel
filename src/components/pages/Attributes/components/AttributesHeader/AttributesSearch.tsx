"use client";

import { Search } from "@/components/common";
import { PaginationData } from "@/shared/types";
import {
  useAttributesStore,
  useCategoryStore,
  useManufactureStore,
} from "@/store/store";
import { Spinner } from "flowbite-react";
import React, { useCallback, useState } from "react";

const AttributesSearch = () => {
  const [loader, setLoader] = useState(false);

  const {
    itemsPerPage,
    fetchAttributes,
    changeCurrentPage,
    changeAttributeFilter,
  } = useAttributesStore();

  const fetchCategoriesData = useCallback(
    async (value: string) => {
      changeCurrentPage(1);

      const filters = {
        filters: {
          name: {
            like: `%${value}%`,
          },
        },
      };

      changeAttributeFilter(filters);

      setLoader(true);
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      };
      const data = await fetchAttributes(paginationData);
      if (data) {
        setLoader(false);
      } else {
        setLoader(true);
      }
    },
    [changeCurrentPage, changeAttributeFilter, fetchAttributes, itemsPerPage]
  );

  return (
    <div className="flex gap-8 items-center">
      <Search getData={fetchCategoriesData} />
      {loader && <Spinner aria-label="Loading..." size="lg" />}
    </div>
  );
};

export default AttributesSearch;
