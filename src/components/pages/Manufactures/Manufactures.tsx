"use client";

import React, { useEffect, useRef, useState } from "react";
import { ManufacturesHeader } from "./Components/ManufacturesHeader/ManufacturesHeader";
import { useManufactureStore } from "@/store/store";
import ManufacturesFormModal from "./Components/ManufactureFormModal/ManufactureFormModal";
import { WarningModal } from "@/components/common";
import {
  PaginationData,
  ManufacturerData,
  ManufacturerFormBody,
} from "@/shared/types";
import manufacturesAPI from "@/services/manufactures";
import { toast } from "react-toastify";
import { ManufacturesTable } from "./Components/ManufacturesTable/ManufacturesTable";

export const Manufactures = () => {
  // TODO some functionalities will be moved to store

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const activeManufacturerRef = useRef<ManufacturerData>();

  const {
    fetchManufactures,
    fetchAllManufactures,
    currentPage,
    editManufacture,
    itemsPerPage,
    totalPages,
    changeCurrentPage,
  } = useManufactureStore();

  // ********* AddNew or Edit Modal *********

  const onCloseModal = () => {
    setIsModalOpen(false);
  };

  // EDIT
  const openEditModal = (manufacturer: ManufacturerData) => {
    activeManufacturerRef.current = manufacturer;
    setIsModalOpen(true);
  };

  // ********* Warning Modal *********
  const onWarningModalOpen = (manufacture: ManufacturerData) => {
    setIsWarningModalOpen(true);
    activeManufacturerRef.current = manufacture;
  };

  const onWarningModalClose = () => {
    setIsWarningModalOpen(false);
  };

  const fetchManufacturesData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };
    await fetchManufactures(paginationData);
  };

  const onWarningModalConfirm = async () => {
    if (!activeManufacturerRef.current) {
      setIsWarningModalOpen(false);
      return;
    }

    const response = await manufacturesAPI.removeManufacture(
      activeManufacturerRef.current?.id
    );

    if (response) {
      const toastMessage = `manufacturer ${activeManufacturerRef.current.name} is removed`;
      toast(toastMessage, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
      fetchManufacturesData();
      fetchAllManufactures();
    }
    setIsWarningModalOpen(false);
  };

  const onSaveEditModal = async (manufacturer: ManufacturerFormBody) => {
    if (!activeManufacturerRef.current?.id) {
      setIsModalOpen(false);
    } else {
      const res = await editManufacture(
        activeManufacturerRef.current?.id,
        manufacturer
      );
      if (res) {
        const toastMessage = `manufacturer ${activeManufacturerRef.current.name} is changed!`;
        toast(toastMessage, {
          hideProgressBar: true,
          autoClose: 2000,
          type: "success",
        });

        fetchManufacturesData();
      }
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      changeCurrentPage(currentPage - 1);
    }
  }, [changeCurrentPage, currentPage, totalPages]);

  useEffect(() => {
    fetchAllManufactures();
  }, [fetchAllManufactures]);

  return (
    <div className="w-full">
      <ManufacturesHeader />
      <ManufacturesTable
        onWarningModalOpen={onWarningModalOpen}
        openEditModal={openEditModal}
      />

      <ManufacturesFormModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSave={onSaveEditModal}
        initialValue={activeManufacturerRef.current}
      />
      <WarningModal
        onSave={onWarningModalConfirm}
        isOpen={isWarningModalOpen}
        onClose={onWarningModalClose}
        message={`Are you sure you want to delete ${activeManufacturerRef.current?.name}?`}
      />
    </div>
  );
};
