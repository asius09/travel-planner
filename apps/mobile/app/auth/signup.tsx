'use client'

import React, { useState, useRef } from 'react'
import { View, Text, ScrollView, Pressable, type TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

export default function SignUpScreen() {
  const router = useRouter()
  const { signUp, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const passwordRef = useRef<React.ElementRef<typeof TextInput>>(null)
  
  const handleSignUp = async () => {
    if (!email || !password) return
    const success = await signUp(email, password)
    if (success) {
      router.replace('/(tabs)')
    }
  }
  
  const handleBack = () => {
    router.back()
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-6 pt-5 pb-3">
        <Pressable onPress={handleBack} accessibilityLabel="Back" className="p-2 -ml-2">
          <Ionicons name="chevron-back" size={28} color="#202822" />
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Text className="font-sans font-medium text-[26px] text-text mx-6 mt-6 mb-2">Create your account</Text>
        <Text className="font-sans text-[15px] text-muted mx-6 mb-8">Save your trips and access them anywhere.</Text>
        
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
              clearError()
            }}
            onSubmitEditing={() => passwordRef.current?.focus()}
            error={error?.includes('email') ? error : undefined}
          />
          <Input
            ref={passwordRef}
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry={!showPassword}
            autoComplete="new-password"
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              clearError()
            }}
            onSubmitEditing={handleSignUp}
            error={error?.includes('password') ? error : undefined}
            helperText="Must be at least 8 characters"
            rightIcon={
              <Pressable
                onPress={() => setShowPassword(prev => !prev)}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#777F78"
                />
              </Pressable>
            }
          />
          
          {error ? (
            <Text className="font-sans text-xs text-[#E57373] -mt-2">{error}</Text>
          ) : null}
          
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth 
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
          >
            Create account
          </Button>
        </View>
      </ScrollView>
      
      <View className="px-6 pb-8 gap-4">
        <View className="flex-row items-center gap-3 my-2">
          <View className="flex-1 h-[1px] bg-border" />
          <Text className="font-sans text-xs text-muted">Already have an account?</Text>
          <View className="flex-1 h-[1px] bg-border" />
        </View>
        <Button variant="outline" size="lg" fullWidth onPress={() => router.push('/auth/signin')}>
          Sign in
        </Button>
      </View>
    </View>
  )
}
