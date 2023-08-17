import Image from "next/image";
import React from "react";
import { HiXCircle } from "react-icons/hi";

type ImagePreviewType = {
  src: string;
  name: string;
  removeAction: (name: string) => void;
};

const ImagePreview: React.FC<ImagePreviewType> = ({
  src,
  name,
  removeAction,
}) => {
  const removeImg = () => {
    removeAction(name);
  };

  return (
    <div className="relative  rounded-lg  w-[100px] h-[100px]">
      <Image
        width={100}
        height={100}
        src={src}
        alt="img"
        className="object-cover rounded-lg relative w-full h-full"
        onLoad={() => URL.revokeObjectURL(src)}
      />

      <p className="mb-3 mt-1 text-gray-500 text-xs truncate dark:text-gray-400 ">
        {name}
      </p>
      <HiXCircle
        onClick={removeImg}
        className="absolute top-0 right-0 translate-x-1/2 translate-y-[-50%] text-red-400 text-2xl hover:text-white cursor-pointer"
      />
    </div>
  );
};

export default ImagePreview;
