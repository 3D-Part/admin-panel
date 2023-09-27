"use client";

import React, { useEffect, useRef, useState } from "react";
// import { AttributesHeader } from "./components/AttributesHeader/AttributesHeader";
import { useAttributesStore } from "@/store/store";
import AttributeFormModal from "./components/AttributeFormModal/AttributeFormModal";
import { WarningModal } from "@/components/common";
import {
  PaginationData,
  AttributeData,
  AttributeFormBody,
} from "@/shared/types";
import { AttributeAPI } from "@/services";
import { toast } from "react-toastify";
import { AttributesTable } from "./components/AttributesTable/AttributesTable";

export const Attributes = () => {
  // TODO some functionalities will be moved to store

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const activeAttributeRef = useRef<AttributeData>();

  const {
    fetchAttributes,
    fetchAllAttributes,
    currentPage,
    editAttribute,
    itemsPerPage,
    totalPages,
    changeCurrentPage,
  } = useAttributesStore();

  // ********* AddNew or Edit Modal *********

  const onCloseModal = () => {
    setIsModalOpen(false);
  };

  // EDIT
  const openEditModal = (attribute: AttributeData) => {
    activeAttributeRef.current = attribute;
    setIsModalOpen(true);
  };

  // ********* Warning Modal *********
  const onWarningModalOpen = (attribute: AttributeData) => {
    setIsWarningModalOpen(true);
    activeAttributeRef.current = attribute;
  };

  const onWarningModalClose = () => {
    setIsWarningModalOpen(false);
  };

  const fetchAttributesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };
    await fetchAttributes(paginationData);
  };

  const onWarningModalConfirm = async () => {
    if (!activeAttributeRef.current) {
      setIsWarningModalOpen(false);
      return;
    }

    const response = await AttributeAPI.removeAttribute(
      activeAttributeRef.current?.id
    );

    if (response) {
      const toastMessage = `attribute ${activeAttributeRef.current.name} is removed`;
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
      fetchAttributesData();
      fetchAllAttributes();
    }
    setIsWarningModalOpen(false);
  };

  const onSaveEditModal = async (attribute: AttributeFormBody) => {
    if (!activeAttributeRef.current?.id) {
      setIsModalOpen(false);
    } else {
      const res = await editAttribute(
        activeAttributeRef.current?.id,
        attribute
      );
      if (res) {
        const toastMessage = `attribute ${activeAttributeRef.current.name} is changed!`;
        toast(toastMessage, {
          hideProgressBar: true,
          autoClose: 2000,
          type: "success",
        });

        fetchAttributesData();
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
    fetchAllAttributes();
  }, [fetchAllAttributes]);

  return (
    <div className="w-full">
      {/* <AttributesHeader /> */}
      <AttributesTable
        onWarningModalOpen={onWarningModalOpen}
        openEditModal={openEditModal}
      />

      <AttributeFormModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={onSaveEditModal}
        initialValue={activeAttributeRef.current}
      />
      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={`Are you sure you want to delete ${activeAttributeRef.current?.name}?`}
      />
    </div>
  );
};
