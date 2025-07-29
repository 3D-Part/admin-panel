'use client'

import React from 'react'
import { useCurrentUserStore } from '@/store/store'
import {
  hasAnyPermission,
  PERMISSION_GROUPS,
} from '@/shared/helpers/permissions'

export const Welcome = () => {
  const { currentUser } = useCurrentUserStore()

  if (!currentUser) {
    return null
  }

  // Get user's available features based on permissions
  const getAvailableFeatures = () => {
    const features = []

    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.PRODUCTS,
        currentUser.role
      )
    ) {
      features.push('Products Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.CATEGORIES,
        currentUser.role
      )
    ) {
      features.push('Categories Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.MANUFACTURERS,
        currentUser.role
      )
    ) {
      features.push('Manufacturers Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.ATTRIBUTES,
        currentUser.role
      )
    ) {
      features.push('Attributes Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.ORDERS,
        currentUser.role
      )
    ) {
      features.push('Orders Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.PROMO_CODES,
        currentUser.role
      )
    ) {
      features.push('Promo Codes Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.SALES,
        currentUser.role
      )
    ) {
      features.push('Sales Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.USERS,
        currentUser.role
      )
    ) {
      features.push('Users Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.EMPLOYEES,
        currentUser.role
      )
    ) {
      features.push('Employees Management')
    }
    if (
      hasAnyPermission(
        currentUser.permissions,
        PERMISSION_GROUPS.SUBSCRIBERS,
        currentUser.role
      )
    ) {
      features.push('Subscribers Management')
    }

    return features
  }

  const availableFeatures = getAvailableFeatures()

  return (
    <div className="w-full flex flex-col h-full overflow-hidden md:overflow-y-auto">
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to 3D Part
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Admin Panel Dashboard
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold animate-spin"></div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold">
                {(currentUser.fullName?.charAt(0) || '3D').toUpperCase()}
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentUser.fullName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {currentUser.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Role: {currentUser.role}
            </p>
          </div>

          {/* Welcome Message */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome back!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              You&apos;re now logged into the 3D Part Admin Panel. Use the
              sidebar navigation to access the features.
            </p>

            {/* Admin Special Message */}
            {currentUser.role === 'admin' && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">👑</span>
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    Administrator Access
                  </span>
                </div>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  As an administrator, you have full access to all features and
                  can manage all aspects of the system.
                </p>
              </div>
            )}

            {/* Available Features */}
            {availableFeatures.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Your Available Features:
                </h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {availableFeatures.map((feature, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                System Status
              </h4>
              <p className="text-green-600 dark:text-green-400 font-medium">
                All Systems Operational
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Security
              </h4>
              <p className="text-green-600 dark:text-green-400 font-medium">
                Authentication Active
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Performance
              </h4>
              <p className="text-green-600 dark:text-green-400 font-medium">
                Optimal Performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
