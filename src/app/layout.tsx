import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ChildrenWrapper from '@/components/layout/ChildrenWrapper'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import SalesModal from '@/components/common/SalesModal/SalesModal'

export const metadata = {
  title: '3D Part',
  description: '3D Part Admin Panel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-white dark:bg-gray-900">
        <LayoutWrapper />
        <ChildrenWrapper>{children}</ChildrenWrapper>

        <ToastContainer theme="colored" />
        <SalesModal />
      </body>
    </html>
  )
}
