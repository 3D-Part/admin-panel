import { TextComponentInterface } from '../../../../shared/interfaces/textInterfaces'

const Display1: React.FC<TextComponentInterface> = ({
  children,
  className,
}) => {
  return (
    <p
      className={`text-[64px] font-extrabold leading-[84px] lg:text-[56px] lg:leading-[72px] text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </p>
  )
}

export default Display1
