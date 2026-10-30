'use client'

import React from 'react'
import { View, Text, ScrollView, Switch, Alert, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Button } from '@/components/ui'
import { useThemeStore } from '@/store/themeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { MOOD_OPTIONS, DURATION_OPTIONS, BUDGET_OPTIONS, TRAVEL_PARTY_OPTIONS } from '@/constants/onboarding'

export default function SettingsScreen() {
  const router = useRouter()
  const { theme, setTheme, tokens } = useThemeStore()
  const { data: onboardingData, setMood, resetOnboarding } = useOnboardingStore()
  const { user, signOut } = useAuthStore()
  const { clearTrip } = useTripStore()
  
  const handleMoodChange = (mood: import('@travel-planner/shared').TravelMood) => {
    setMood(mood)
    setTheme(mood)
  }
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign out?',
      'You\'ll need to sign in again to sync your trip.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign out', 
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/')
          }
        },
      ]
    )
  }
  
  const handleClearTrip = () => {
    Alert.alert(
      'Clear your trip?',
      'This will remove all destinations from your trip. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear trip', 
          style: 'destructive',
          onPress: () => {
            clearTrip()
          }
        },
      ]
    )
  }
  
  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset preferences?',
      'This will reset your travel preferences but keep your saved trip.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetOnboarding()
            router.replace('/onboarding/mood')
          }
        },
      ]
    )
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-5 pt-5 pb-3">
        <Text className="font-sans font-medium text-[28px] text-text">Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Travel Mood */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Travel mood</Text>
            <Text className="font-sans text-sm text-muted mt-1">Changes recommendations and accent colors. Your trip stays the same.</Text>
          </View>
          <View className="p-5 gap-4">
            <View className="gap-2.5">
              {MOOD_OPTIONS.map((option) => {
                const isSelected = theme === option.value
                return (
                  <Pressable
                    key={option.value}
                    className={`flex-row items-center p-3.5 rounded-[14px] border-2 gap-3 ${
                      isSelected ? 'border-primary bg-soft' : 'border-border bg-surface'
                    }`}
                    onPress={() => handleMoodChange(option.value)}
                  >
                    <View
                      className={`w-9 h-9 rounded-[10px] items-center justify-center ${
                        isSelected ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={18}
                        color={isSelected ? '#FFFFFF' : '#263F35'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-sans text-[15px] text-text ${isSelected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </Text>
                      <Text className="font-sans text-xs text-muted">{option.description}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>
        </View>
        
        {/* Display Currency */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Display currency</Text>
            <Text className="font-sans text-sm text-muted mt-1">Changes how prices are formatted. Does not convert amounts.</Text>
          </View>
          <View className="p-5 gap-4">
            <View className="flex-row gap-2.5">
              <Pressable
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl border-2 border-primary bg-soft"
                onPress={() => {}}
              >
                <Text className="font-sans font-medium text-[15px] text-primary">USD ($)</Text>
              </Pressable>
              <Pressable
                className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl border-2 border-border bg-surface"
                onPress={() => {}}
              >
                <Text className="font-sans font-normal text-[15px] text-text">INR (₹)</Text>
              </Pressable>
            </View>
          </View>
        </View>
        
        {/* Planning Preferences */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Planning preferences</Text>
            <Text className="font-sans text-sm text-muted mt-1">Update your preferences to get better recommendations.</Text>
          </View>
          <View className="p-5 gap-4">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="font-sans text-base text-text">Duration</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">
                  {onboardingData.duration ? DURATION_OPTIONS.find(o => o.value === onboardingData.duration)?.label : 'Not set'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#777F78" />
            </View>
            
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="font-sans text-base text-text">Budget</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">
                  {onboardingData.budget ? BUDGET_OPTIONS.find(o => o.value === onboardingData.budget)?.label : 'Not set'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#777F78" />
            </View>
            
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="font-sans text-base text-text">Travel party</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">
                  {onboardingData.travelParty ? TRAVEL_PARTY_OPTIONS.find(o => o.value === onboardingData.travelParty)?.label : 'Not set'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#777F78" />
            </View>
            
            <Button variant="outline" size="sm" fullWidth onPress={() => router.push('/onboarding/mood')}>
              Update all preferences
            </Button>
          </View>
        </View>
        
        {/* Permissions */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Permissions</Text>
            <Text className="font-sans text-sm text-muted mt-1">Manage optional permissions for enhanced features.</Text>
          </View>
          <View className="p-5 gap-4">
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="font-sans text-base text-text">Location</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">Used for nearby destination sorting</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor={tokens.primary}
              />
            </View>
            
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="font-sans text-base text-text">Notifications</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">Trip reminders and updates</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor={tokens.primary}
              />
            </View>
          </View>
        </View>
        
        {/* Account */}
        {user ? (
          <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
            <View className="p-5 border-b border-border">
              <Text className="font-sans font-medium text-lg text-text">Account</Text>
            </View>
            <View className="p-5 gap-4">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-1">
                  <Text className="font-sans text-base text-text">Email</Text>
                  <Text className="font-sans text-[13px] text-muted mt-0.5">{user.email}</Text>
                </View>
              </View>
              <Pressable onPress={handleSignOut} className="py-2.5 items-center">
                <Text className="font-sans font-medium text-base text-[#E57373]">Sign out</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        
        {/* Data Management */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Data</Text>
          </View>
          <View className="p-5 gap-3">
            <Pressable onPress={handleClearTrip} className="py-2.5 items-center">
              <Text className="font-sans font-medium text-base text-[#E57373]">Clear my trip</Text>
            </Pressable>
            <Pressable onPress={handleResetOnboarding} className="py-2.5 items-center">
              <Text className="font-sans font-medium text-base text-[#E57373]">Reset preferences</Text>
            </Pressable>
          </View>
        </View>
        
        <View className="p-5 items-center">
          <Text className="font-sans text-[13px] text-muted">Travel Planner v0.1.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}
