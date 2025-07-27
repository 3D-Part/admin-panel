import React from 'react'
import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Heading1: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-[56px] font-semibold leading-[72px] lg:text-[48px] lg:leading-[48px] text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h1>
  )
}

export default Heading1
