'use client'

import React from 'react'
import { useCurrentUserStore } from '@/store/store'

export const Welcome = () => {
  const { currentUser } = useCurrentUserStore()

  if (!currentUser) {
    return null
  }

  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-8">
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
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                ✅
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                System Online
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                All services running
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                🔐
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Secure Access
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your session is protected
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                ⚡
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Fast & Reliable
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Optimized performance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
