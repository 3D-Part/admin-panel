"use client";

import { useProductsStore } from "@/store/store";
import React from "react";
import Img from "./components/Img";
import Title from "./components/Title";

const S3_URL = process.env.S3_URL;

const ImagesPresenter = () => {
  const { activeProduct } = useProductsStore();
  const { images } = activeProduct;

  if (images?.length === 0) return <Title />;

  return (
    <div className="flex flex-col align-baseline gap-8 mb-12">
      <Title />
      <div className="flex flex-wrap gap-8">
        {images?.map((image) => {
          return (
            <div key={image.imageId}>
              <Img
                src={`${S3_URL}/${image.imageId}`}
                id={image.id}
                isMain={image.isMain}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImagesPresenter;
