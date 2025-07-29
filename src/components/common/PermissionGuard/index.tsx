'use client'

import React from 'react'
import { usePermissionGuard } from '@/shared/hooks/usePermissionGuard'

interface PermissionGuardProps {
  children: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ children }) => {
  // This hook will handle permission checking and redirects
  usePermissionGuard()

  return <>{children}</>
}

export default PermissionGuard
