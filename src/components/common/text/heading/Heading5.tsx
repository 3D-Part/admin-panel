import React from 'react'
import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Heading5: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-2xl font-semibold leading-8 lg:text-[20px] lg:leading-7 text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h1>
  )
}

export default Heading5
