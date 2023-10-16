import { Order, OrderProduct } from "@/shared/types";
import { Button, Modal } from "flowbite-react";
import React, { useEffect } from "react";

type OrderDetailsType = {
  isOpen: boolean;
  order: Order;
  onClose: () => void;
};

type OrderDetailType = {
  name: string;
  value: string;
};
const OrderDetail: React.FC<OrderDetailType> = ({ value, name }) => {
  return (
    <div className="flex justify-between items-center gap-4 flex-1 basis-[48%] rounded-lg bg-slate-600 text-white p-5">
      <p className="font-semibold">{name}</p>
      <span className="text-gray-300">{value}</span>
    </div>
  );
};

type ProductDetailWrapperType = {
  name: string;
  value: string | number;
};

const ProductDetailWrapper: React.FC<ProductDetailWrapperType> = ({
  name,
  value,
}) => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-3">
      <p className="font-semibold">{name}</p>
      <p className="text-gray-400">{value}</p>
    </div>
  );
};

type ProductWrapperType = {
  product: OrderProduct;
};
const ProductWrapper: React.FC<ProductWrapperType> = ({ product }) => {
  const { name, price, quantity, sku, total } = product;

  return (
    <div className="flex justify-between items-center gap-4 flex-1 rounded-lg bg-slate-600 text-white p-5">
      <ProductDetailWrapper name="Name:" value={name} />
      <ProductDetailWrapper name="Price:" value={price} />
      <ProductDetailWrapper name="Quantity:" value={quantity} />
      <ProductDetailWrapper name="Sku:" value={sku} />
      <ProductDetailWrapper name="Total:" value={total} />
    </div>
  );
};

const OrderDetails: React.FC<OrderDetailsType> = ({
  isOpen,
  order,
  onClose,
}) => {
  const {
    createdAt,
    city,
    street,
    fullName,
    status,
    email,
    price,
    total,
    orderNumber,
    phone,
    postCode,
    shippingPrice,
    discount,
    products,
  } = order;

  const isoDate = createdAt;
  const date = new Date(isoDate);
  const year = date.toLocaleString("en-US", { year: "numeric" });
  const month = date.toLocaleString("en-US", { month: "2-digit" });
  const day = date.toLocaleString("en-US", { day: "2-digit" });
  const formattedDate = `${day}.${month}.${year}`;

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="4xl">
      <Modal.Header>
        Order number <span className="text-gray-400">#{orderNumber}</span>
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-wrap gap-4">
          <OrderDetail name="Full name:" value={fullName} />
          <OrderDetail name="Email:" value={email} />
          <OrderDetail name="Date:" value={formattedDate} />
          <OrderDetail name="Status:" value={status} />
          <OrderDetail name="Price:" value={price} />
          <OrderDetail name="Total:" value={total} />
          <OrderDetail name="Shipping price:" value={shippingPrice} />
          <OrderDetail name="Discount:" value={discount} />
          <OrderDetail name="City:" value={city} />
          <OrderDetail name="Street:" value={street} />
          <OrderDetail name="PostCode:" value={postCode} />
          <OrderDetail name="Phone:" value={phone} />
        </div>

        <div className="mt-8 text-white">
          <h3 className="font-semibold text-xl mb-4">Products:</h3>
          <div className="flex flex-wrap gap-4">
            {products.map((product) => {
              return <ProductWrapper key={product.id} product={product} />;
            })}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderDetails;
