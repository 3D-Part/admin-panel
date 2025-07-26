import React from 'react'
import { Spinner } from 'flowbite-react'

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-spin">
          <Spinner
            aria-label="Verifying your account"
            size="lg"
            color="white"
            className="dark:text-white"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          Verifying Your Account
        </h2>
        <p className="text-gray-600 dark:text-white/60 leading-relaxed">
          Please wait while we verify your email address. This should only take
          a moment.
        </p>
      </div>
    </div>
  )
}

export default LoadingState
