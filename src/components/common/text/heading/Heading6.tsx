import React from 'react'
import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Heading6: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-[20px] font-semibold leading-7 lg:text-lg lg:leading-7 ${className}`}
    >
      {children}
    </h1>
  )
}

export default Heading6
