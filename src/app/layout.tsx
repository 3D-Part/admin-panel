import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ChildrenWrapper from '@/components/layout/ChildrenWrapper'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import AddProductsOnSaleModal from '@/components/pages/Products/components/AddProductsOnSaleModal/AddProductsOnSaleModal'
import AuthCheck from '@/components/common/AuthCheck'
import ThemeProvider from '@/components/common/ThemeProvider'

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
    <html lang="en">
      <body className="bg-white dark:bg-gray-900">
        <ThemeProvider>
          <AuthCheck>
            <LayoutWrapper />
            <ChildrenWrapper>{children}</ChildrenWrapper>
          </AuthCheck>

          <ToastContainer theme="colored" />
          <AddProductsOnSaleModal />
        </ThemeProvider>
      </body>
    </html>
  )
}
