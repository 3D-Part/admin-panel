import React from 'react'
import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Heading4: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-[28px] font-semibold leading-9 lg:text-2xl lg:leading-8 text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h1>
  )
}

export default Heading4
