import React from 'react'

const SuccessState = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
          Verification Successful!
        </h2>
        <p className="text-gray-600 dark:text-white/60 mb-6 leading-relaxed">
          Your account has been verified successfully. You can now access all
          features.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-700 font-medium">
            Redirecting to homepage in a few seconds...
          </p>
        </div>
      </div>
    </div>
  )
}

export default SuccessState
