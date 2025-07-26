'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthAPI from '@/services/auth'
import {
  LoadingState,
  SuccessState,
  ErrorState,
} from '@/components/pages/AuthVerify/components'

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

  return <SuccessState />

  if (isLoading) {
    return <LoadingState />
  }

  if (isSuccess) {
    return <SuccessState />
  }

  return (
    <ErrorState
      error={error || 'Verification failed'}
      onRetry={handleRetry}
      onGoHome={handleGoHome}
    />
  )
}

export default VerifyPage
