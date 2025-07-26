import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ChildrenWrapper from '@/components/layout/ChildrenWrapper'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import AddProductsOnSaleModal from '@/components/pages/Products/components/AddProductsOnSaleModal/AddProductsOnSaleModal'
import AuthCheck from '@/components/common/AuthCheck'

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
        <AuthCheck>
          <LayoutWrapper />
          <ChildrenWrapper>{children}</ChildrenWrapper>
        </AuthCheck>

        <ToastContainer theme="colored" />
        <AddProductsOnSaleModal />
      </body>
    </html>
  )
}
