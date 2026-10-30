'use client'

import React from 'react'
import { View, Text, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button, ProgressIndicator, OnboardingOption } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'
import { BUDGET_OPTIONS } from '@/constants/onboarding'

export default function BudgetOnboardingScreen() {
  const router = useRouter()
  const { data, setBudget } = useOnboardingStore()
  
  const handleSelectBudget = (budget: import('@travel-planner/shared').Budget) => {
    setBudget(budget)
  }
  
  const handleContinue = () => {
    if (data.budget) {
      router.push('/onboarding/travel-party')
    }
  }
  
  const handleSkip = () => {
    router.push('/onboarding/travel-party')
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
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <ProgressIndicator currentStep={3} totalSteps={5} className="px-6 mb-2" />
        
        <View className="pb-6">
          <Text className="font-sans font-medium text-[26px] text-text mx-6 mt-2 mb-1">
            What feels right for your budget?
          </Text>
          <Text className="font-sans text-[15px] text-muted mx-6 mb-6">
            We'll show you destinations that match your comfort level.
          </Text>
          
          <View className="px-6 gap-3">
            {BUDGET_OPTIONS.map((option) => (
              <OnboardingOption
                key={option.value}
                label={option.label}
                description={option.description}
                selected={data.budget === option.value}
                onPress={() => handleSelectBudget(option.value)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View className="px-6 pb-8 gap-3">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onPress={handleContinue}
          disabled={!data.budget}
        >
          Continue
        </Button>
        <Pressable onPress={handleSkip} accessibilityLabel="Skip this question" className="p-2 items-center">
          <Text className="font-sans text-[15px] text-muted text-center">Skip for now</Text>
        </Pressable>
      </View>
    </View>
  )
}
