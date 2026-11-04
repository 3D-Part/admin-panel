'use client'
import { tx } from '@/shared/i18n'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthAPI from '@/services/auth'
import {
  LoadingState,
  SuccessState,
  ErrorState,
  PasswordForm,
} from '@/components/pages/AuthVerify/components'
import { URLPartsEnum } from '@/shared/enums'

const VerifyPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Extract token from URL on component mount
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError(tx("No verification token provided"))
    }
  }, [searchParams])

  const handlePasswordSubmit = async (password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const token = searchParams.get('token')
      if (!token) {
        setError(tx("No verification token provided"))
        setIsLoading(false)
        return
      }

      // Single request: accept with token and password
      const acceptSuccess = await AuthAPI.acceptVerification(token, password)

      if (acceptSuccess) {
        setIsSuccess(true)
        setIsLoading(false)

        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          router.push(URLPartsEnum.Login)
        }, 2000)
      } else {
        setError(tx("Account activation failed. Please try again."))
        setIsLoading(false)
      }
    } catch (error: any) {
      setError(tx("Verification failed. Please try again."))
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    // Reset to password form
    setIsSuccess(false)
    setIsLoading(false)
  }

  const handleGoLogin = () => {
    router.push(URLPartsEnum.Login)
  }

  // Show error if no token provided
  if (!searchParams.get('token')) {
    return (
      <ErrorState
        error="No verification token provided"
        onRetry={handleRetry}
        onGoLogin={handleGoLogin}
      />
    )
  }

  // Show success state
  if (isSuccess) {
    return <SuccessState />
  }

  // Show password form (default state)
  return <PasswordForm onSubmit={handlePasswordSubmit} isLoading={isLoading} />
}

export default VerifyPage
