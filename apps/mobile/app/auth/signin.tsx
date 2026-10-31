'use client'

import React, { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, LayoutAnimation, Platform, UIManager, type TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore'
import { semanticColors } from '@/theme/colors'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function SignInScreen() {
  const router = useRouter()
  const { signIn, loading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const passwordRef = useRef<React.ElementRef<typeof TextInput>>(null)

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [error, emailError, passwordError])

  const validate = (): boolean => {
    let valid = true
    setEmailError(null)
    setPasswordError(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      setEmailError('Please enter your email')
      valid = false
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address')
      valid = false
    }

    if (!password) {
      setPasswordError('Please enter your password')
      valid = false
    }

    return valid
  }

  const handleSignIn = async () => {
    if (!validate()) return

    const success = await signIn(email.trim(), password)
    if (success) {
      const isComplete = useOnboardingStore.getState().data.completed
      if (isComplete) {
        router.replace('/(tabs)/explore')
      } else {
        const resumeStep = getResumeStep(useOnboardingStore.getState().data)
        router.replace(resumeStep)
      }
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
        <Pressable onPress={handleBack} accessibilityLabel="Back" className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color={semanticColors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-sans font-medium text-[28px] text-foreground mx-6 mt-4 mb-2">
          Welcome back
        </Text>
        <Text className="font-sans text-[15px] text-muted-foreground mx-6 mb-8 leading-6">
          Sign in to keep your plans in sync.
        </Text>

        <View className="px-6 gap-4">
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              if (emailError) setEmailError(null)
              clearError()
            }}
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={emailError ?? (error?.toLowerCase().includes('email') ? error : undefined)}
          />

          <Input
            ref={passwordRef}
            label="Password"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="password"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              if (passwordError) setPasswordError(null)
              clearError()
            }}
            onSubmitEditing={handleSignIn}
            error={passwordError ?? undefined}
            rightIcon={
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={semanticColors.mutedForeground}
                />
              </Pressable>
            }
          />

          {error ? (
            <View className="flex-row items-center bg-destructive/10 border border-destructive/30 rounded-xl px-3.5 py-3 gap-2.5">
              <Ionicons name="alert-circle" size={18} color={semanticColors.destructive} />
              <Text className="flex-1 font-sans text-[13.5px] leading-[19px] font-medium text-destructive">
                {error}
              </Text>
            </View>
          ) : null}

          <View className="mt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8 gap-4">
        <View className="flex-row items-center gap-3 my-2">
          <View className="flex-1 h-[1px] bg-border" />
          <Text className="font-sans text-xs text-muted-foreground">Or</Text>
          <View className="flex-1 h-[1px] bg-border" />
        </View>
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/auth/signup')}
        >
          Create account
        </Button>
      </View>
    </View>
  )
}