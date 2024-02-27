import React from 'react'
import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Display2: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <p
      className={`text-[56px] font-semibold leading-[72px] lg:text-[48px] lg:leading-[48px] ${className}`}
    >
      {children}
    </p>
  )
}

export default Display2
