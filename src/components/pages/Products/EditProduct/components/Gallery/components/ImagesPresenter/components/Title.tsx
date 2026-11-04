import { tx } from '@/shared/i18n'
const Title = () => {
  return (
    <h2 className="text-2xl font-extrabold leading-none tracking-tight text-gray-800 md:text-2xl dark:text-white">
      {tx("Gallery:")}
    </h2>
  )
}

export default Title
