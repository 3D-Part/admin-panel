import React from 'react'
import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Heading3: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-3xl font-bold leading-9 lg:text-[28px] lg:leading-9 text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h1>
  )
}

export default Heading3
