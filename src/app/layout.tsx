import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import ChildrenWrapper from '@/components/layout/ChildrenWrapper'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import AddProductsOnSaleModal from '@/components/pages/Products/components/AddProductsOnSaleModal/AddProductsOnSaleModal'
import AuthCheck from '@/components/common/AuthCheck'
import ThemeProvider from '@/components/common/ThemeProvider'
import PermissionGuard from '@/components/common/PermissionGuard'

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
      <body className="flex flex-col bg-white dark:bg-gray-900 h-auto md:h-screen md:overflow-hidden">
        <ThemeProvider>
          <AuthCheck>
            <PermissionGuard>
              <LayoutWrapper />
              <ChildrenWrapper>{children}</ChildrenWrapper>
            </PermissionGuard>
          </AuthCheck>

          <ToastContainer theme="colored" />
          <AddProductsOnSaleModal />
        </ThemeProvider>
      </body>
    </html>
  )
}
