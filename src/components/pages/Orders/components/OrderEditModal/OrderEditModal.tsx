"use client";

import { OrderStatusEnum } from "@/shared/enums";
import executeOrderAction from "@/shared/helpers/executeOrderAction";
import getOrderStatusStyle from "@/shared/helpers/getOrderStatusStyle";
import { Order, PaginationData } from "@/shared/types";
import { useOrdersStore } from "@/store/store";
import {
  Badge,
  Button,
  Dropdown,
  Label,
  Modal,
  Textarea,
} from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type ModalType = {
  isOpen: boolean;
  initialValue?: Order;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
};

const OrderEditModal: React.FC<ModalType> = ({
  isOpen,
  setIsModalOpen,
  initialValue,
  // onSave,
  onClose,
}) => {
  const { Item } = Dropdown;

  const [activeStatus, setActiveStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const declineMessageRef = useRef("");

  const orderStatus = [
    OrderStatusEnum.Pending,
    OrderStatusEnum.Accepted,
    OrderStatusEnum.Declined,
    OrderStatusEnum.Shipping,
    OrderStatusEnum.Finished,
  ];

  const { currentPage, itemsPerPage, fetchOrders } = useOrdersStore();

  useEffect(() => {
    if (!initialValue) return;

    setActiveStatus(initialValue.status);
  }, [initialValue]);

  useEffect(() => {
    declineMessageRef.current = "";
  }, [activeStatus]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { value } = e.target;

    declineMessageRef.current = value;
  };

  const fetchOrdersData = async () => {
    const paginationData: PaginationData = {
      offset: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
    };
    await fetchOrders(paginationData);
  };

  const saveFunction = async () => {
    if (!initialValue) return;

    let response;
    setLoading(true);

    if (activeStatus === OrderStatusEnum.Declined) {
      const _body = {
        message: declineMessageRef.current,
      };

      response = await executeOrderAction(initialValue.id, activeStatus, _body);
    } else {
      response = await executeOrderAction(initialValue.id, activeStatus);
    }

    await fetchOrdersData();

    setLoading(false);
    setIsModalOpen(false);

    if (response) {
      toast(`Order status is changed!`, {
        hideProgressBar: true,
        autoClose: 2000,
        type: "success",
      });
    }
  };

  return (
    <>
      <Modal dismissible show={isOpen} onClose={onClose}>
        <Modal.Header>Order Status</Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex max-w-md flex-col gap-4"
          >
            <div>
              <div className="mb-2 block">
                <Label htmlFor="attributeName" value="Change order status" />
              </div>
              <Dropdown label={activeStatus ? activeStatus : "Change status"}>
                {orderStatus.map((status) => {
                  const statusStyle = getOrderStatusStyle(status);

                  return (
                    <Item key={status} onClick={() => setActiveStatus(status)}>
                      <Badge className={`justify-center w-full ${statusStyle}`}>
                        {status}
                      </Badge>
                    </Item>
                  );
                })}
              </Dropdown>
            </div>

            {activeStatus === OrderStatusEnum.Declined && (
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="declineMessage" value="Decline message" />
                </div>
                <Textarea
                  onChange={handleInputChange}
                  id="declineMessage"
                  name="description"
                  placeholder="Order decline message..."
                  rows={4}
                />
              </div>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            isProcessing={loading}
            disabled={loading}
            onClick={saveFunction}
          >
            Save
          </Button>
          <Button disabled={loading} color="gray" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderEditModal;
