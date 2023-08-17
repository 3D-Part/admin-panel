import React from "react";
import { TextComponentInterface } from "../../../../shared/interfaces/textInterfaces";

const Heading4: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-[28px] font-semibold leading-9 lg:text-2xl lg:leading-8 ${className}`}
    >
      {children}
    </h1>
  );
};

export default Heading4;
