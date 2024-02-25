"use client";

import React, { useEffect, useRef, useState } from "react";
import { CategoriesTable } from "./components/CategoriesTable/CategoriesTable";
import { useCategoryStore } from "@/store/store";
import CategoryEditModal from "./components/CategoryEditModal/CategoryEditModal";
import { WarningModal } from "@/components/common";
import { PaginationData, CategoryData, CategoryFormBody } from "@/shared/types";
import { toast } from "react-toastify";
import { CategoriesAPI } from "@/services";
import { CategoriesHeader } from "./components/CategoriesHeader/CategoriesHeader";

export const Categories = () => {
  // TODO some functionalities will be moved to store

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const activeCategoryRef = useRef<CategoryData>();

  const {
    fetchCategories,
    fetchAllCategories,
    currentPage,
    editCategory,
    itemsPerPage,
    totalPages,
    changeCurrentPage,
  } = useCategoryStore();

  // ********* AddNew or Edit Modal *********

  const onCloseModal = () => {
    setIsModalOpen(false);
  };

  // EDIT
  const openEditModal = (category: CategoryData) => {
    activeCategoryRef.current = category;
    setIsModalOpen(true);
  };

  // ********* Warning Modal *********
  const onWarningModalOpen = (category: CategoryData) => {
    setIsWarningModalOpen(true);
    activeCategoryRef.current = category;
  };

  const onWarningModalClose = () => {
    setIsWarningModalOpen(false);
  };

  const fetchCategoriesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };
    await fetchCategories(paginationData);
  };

  const onWarningModalConfirm = async () => {
    if (!activeCategoryRef.current) {
      setIsWarningModalOpen(false);
      return;
    }

    const response = await CategoriesAPI.removeCategory(
      activeCategoryRef.current?.id
    );

    if (response) {
      const toastMessage = `category ${activeCategoryRef.current.name} is removed`;
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
      fetchCategoriesData();
      fetchAllCategories();
    }
    setIsWarningModalOpen(false);
  };

  const onSaveEditModal = async (category: CategoryFormBody) => {
    if (!activeCategoryRef.current?.id) {
      setIsModalOpen(false);
    } else {
      const res = await editCategory(activeCategoryRef.current?.id, category);
      if (res) {
        const toastMessage = `category ${activeCategoryRef.current.name} is changed!`;
        toast(toastMessage, {
          hideProgressBar: true,
          autoClose: 2000,
          type: "success",
        });

        fetchCategoriesData();
      }
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && currentPage > 1) {
      changeCurrentPage(currentPage - 1);
    }
  }, [changeCurrentPage, currentPage, totalPages]);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  return (
    <div className="w-full">
      <CategoriesHeader />
      <CategoriesTable
        onWarningModalOpen={onWarningModalOpen}
        openEditModal={openEditModal}
      />

      <CategoryEditModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={onSaveEditModal}
        initialValue={activeCategoryRef.current}
      />
      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={`Are you sure you want to delete ${activeCategoryRef.current?.name}?`}
      />
    </div>
  );
};
