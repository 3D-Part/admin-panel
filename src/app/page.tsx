'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useCurrentUserStore } from '@/store/store'
import { Welcome } from '@/components/pages/Welcome/Welcome'

export default function WelcomePage() {
  const router = useRouter()
  const { currentUser } = useCurrentUserStore()

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!currentUser) {
      router.push('/login')
      return
    }
  }, [currentUser, router])

  if (!currentUser) {
    return null
  }

  return <Welcome />
}
