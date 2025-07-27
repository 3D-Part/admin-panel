import { ParagraphComponentInterface } from '@/shared/interfaces/textInterfaces'
import React from 'react'

const Paragraph: React.FC<ParagraphComponentInterface> = ({
  children,
  className,
  size,
  weight,
}) => {
  const WeightType = {
    Semibold: 'font-bold',
    Medium: 'font-semibold',
    Regular: 'font-normal',
  }

  const SizeType = {
    L: 'text-lg leading-7',
    M: 'text-base leading-6',
    S: 'text-sm leading-5',
    XS: 'text-xs leading-4 ',
  }

  return (
    <p
      className={`${SizeType[size]} ${WeightType[weight]} text-gray-700 dark:text-gray-300 ${className}`}
    >
      {children}
    </p>
  )
}

export default Paragraph
