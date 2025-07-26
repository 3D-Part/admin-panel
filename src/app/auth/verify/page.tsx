'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Spinner } from 'flowbite-react'
import AuthAPI from '@/services/auth'

const VerifyPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setError('No verification token provided')
        setIsLoading(false)
        return
      }

      try {
        const success = await AuthAPI.verifyEmail(token)

        if (success) {
          setIsSuccess(true)
          setIsLoading(false)

          // Redirect to homepage after 2 seconds
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setError('Verification failed. Please try again.')
          setIsLoading(false)
        }
      } catch (error: any) {
        setError('Verification failed. Please try again.')
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [searchParams, router])

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    // Reload the page to retry
    window.location.reload()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center ">
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
            Please wait while we verify your email address. This should only
            take a moment.
          </p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center ">
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

  return (
    <div className="h-full flex-1 flex items-center justify-center ">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
          Verification Failed
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 border border-gray-200"
          >
            <svg
              className="w-5 h-5 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyPage
