'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Switch, Alert, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
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

  const [locationGranted, setLocationGranted] = useState(false)
  const [notificationsGranted, setNotificationsGranted] = useState(false)

  useEffect(() => {
    // Check initial permission statuses
    Location.getForegroundPermissionsAsync()
      .then(({ status }) => setLocationGranted(status === 'granted'))
      .catch(() => {})

    Notifications.getPermissionsAsync()
      .then(({ status }) => setNotificationsGranted(status === 'granted'))
      .catch(() => {})
  }, [])

  const handleMoodChange = (mood: import('@travel-planner/shared').TravelMood) => {
    setMood(mood)
    setTheme(mood)
  }

  const handleToggleLocation = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        setLocationGranted(status === 'granted')
      } catch {
        setLocationGranted(false)
      }
    } else {
      setLocationGranted(false)
    }
  }

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync()
        setNotificationsGranted(status === 'granted')
      } catch {
        setNotificationsGranted(false)
      }
    } else {
      setNotificationsGranted(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign out?',
      "You'll need to sign in again to sync your trip.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut()
            router.replace('/')
          },
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
          },
        },
      ]
    )
  }

  const handleResetPreferences = () => {
    Alert.alert(
      'Reset preferences?',
      'This will reset your travel preferences but keep your saved trip intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding()
            router.replace('/onboarding/mood')
          },
        },
      ]
    )
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-5 pt-12 pb-3">
        <Text className="font-sans font-medium text-[28px] text-text">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        {user ? (
          <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
            <View className="p-5 border-b border-border">
              <Text className="font-sans font-medium text-lg text-text">Account</Text>
            </View>
            <View className="p-5 gap-3">
              {user.name ? (
                <View className="flex-row items-center justify-between py-1">
                  <Text className="font-sans text-sm text-muted">Name</Text>
                  <Text className="font-sans font-medium text-[15px] text-text">
                    {user.name}
                  </Text>
                </View>
              ) : null}
              <View className="flex-row items-center justify-between py-1">
                <Text className="font-sans text-sm text-muted">Email</Text>
                <Text className="font-sans font-medium text-[15px] text-text">
                  {user.email}
                </Text>
              </View>
              <View className="pt-2 border-t border-border mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onPress={handleSignOut}
                >
                  Sign out
                </Button>
              </View>
            </View>
          </View>
        ) : null}

        {/* Travel Mood */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Travel mood</Text>
            <Text className="font-sans text-sm text-muted mt-1">
              Changes recommendations and accent colors. Your trip stays the same.
            </Text>
          </View>
          <View className="p-5 gap-2.5">
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
                    <Text
                      className={`font-sans text-[15px] text-text ${
                        isSelected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="font-sans text-xs text-muted">{option.description}</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Planning Preferences */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">
              Planning preferences
            </Text>
            <Text className="font-sans text-sm text-muted mt-1">
              Update preferences to get tailored recommendations.
            </Text>
          </View>
          <View className="p-5 gap-3">
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="font-sans text-base text-text">Duration</Text>
              <Text className="font-sans text-[14px] text-muted">
                {onboardingData.duration
                  ? DURATION_OPTIONS.find((o) => o.value === onboardingData.duration)?.label
                  : 'Flexible'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-t border-border">
              <Text className="font-sans text-base text-text">Budget</Text>
              <Text className="font-sans text-[14px] text-muted">
                {onboardingData.budget
                  ? BUDGET_OPTIONS.find((o) => o.value === onboardingData.budget)?.label
                  : 'Balanced'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-t border-border">
              <Text className="font-sans text-base text-text">Travel party</Text>
              <Text className="font-sans text-[14px] text-muted">
                {onboardingData.travelParty
                  ? TRAVEL_PARTY_OPTIONS.find((o) => o.value === onboardingData.travelParty)?.label
                  : 'Solo'}
              </Text>
            </View>

            <View className="pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onPress={() => router.push('/onboarding/duration')}
              >
                Change preferences
              </Button>
            </View>
          </View>
        </View>

        {/* Permissions */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Permissions</Text>
            <Text className="font-sans text-sm text-muted mt-1">
              Optional permissions for local recommendations and reminders.
            </Text>
          </View>
          <View className="p-5 gap-4">
            <View className="flex-row items-center justify-between py-1">
              <View className="flex-1 mr-4">
                <Text className="font-sans text-base text-text">Location</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">
                  Used for sorting nearby places
                </Text>
              </View>
              <Switch
                value={locationGranted}
                onValueChange={handleToggleLocation}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between py-1 border-t border-border pt-3">
              <View className="flex-1 mr-4">
                <Text className="font-sans text-base text-text">Notifications</Text>
                <Text className="font-sans text-[13px] text-muted mt-0.5">
                  Trip reminders and planning tips
                </Text>
              </View>
              <Switch
                value={notificationsGranted}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Data Management */}
        <View className="bg-surface rounded-[20px] border border-border mx-5 mb-4 overflow-hidden">
          <View className="p-5 border-b border-border">
            <Text className="font-sans font-medium text-lg text-text">Data</Text>
          </View>
          <View className="p-5 gap-3">
            <Pressable onPress={handleClearTrip} className="py-2.5 items-center">
              <Text className="font-sans font-medium text-base text-[#E57373]">
                Clear my trip
              </Text>
            </Pressable>
            <Pressable onPress={handleResetPreferences} className="py-2.5 items-center">
              <Text className="font-sans font-medium text-base text-primary">
                Reset preferences
              </Text>
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
