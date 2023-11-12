"use client";

import { Search } from "@/components/common";
import { PaginationData } from "@/shared/types";
import { useProductsStore } from "@/store/store";
import { Spinner } from "flowbite-react";
import React, { useCallback, useState } from "react";

const ProductsSearch = () => {
  const [loader, setLoader] = useState(false);

  const {
    itemsPerPage,
    fetchProducts,
    changeCurrentPage,
    changeProductFilter,
  } = useProductsStore();

  const fetchProductsData = useCallback(
    async (value: string) => {
      changeCurrentPage(1);

      const filters = {
        filters: {
          name: {
            like: `%${value}%`,
          },
        },
      };

      changeProductFilter(filters);

      setLoader(true);
      const paginationData: PaginationData = {
        offset: 0,
        limit: itemsPerPage,
      };
      const data = await fetchProducts(paginationData);
      if (data) {
        setLoader(false);
      } else {
        setLoader(true);
      }
    },
    [changeCurrentPage, fetchProducts, itemsPerPage]
  );

  return (
    <div className="flex gap-8 items-center">
      <Search getData={fetchProductsData} />
      {loader && <Spinner aria-label="Loading..." size="lg" />}
    </div>
  );
};

export default ProductsSearch;
