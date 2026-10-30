'use client'

import { useEffect } from 'react'
import { useRouter } from 'expo-router'

export default function PermissionsRedirectScreen() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/onboarding/location')
  }, [router])

  return null
}
