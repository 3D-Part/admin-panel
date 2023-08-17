import React from "react";
import { TextComponentInterface } from "../../../../shared/interfaces/textInterfaces";

const Heading2: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-5xl font-bold leading-[48px] lg:text-[32px] lg:leading-10 ${className}`}
    >
      {children}
    </h1>
  );
};

export default Heading2;
