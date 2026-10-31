'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Switch, Alert, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ProfileAvatar, PreferenceSummary } from '@/components/ui'
import { useThemeStore } from '@/store/themeStore'
import { useOnboardingStore, type TravelMood } from '@/store/onboardingStore'
import { useAuthStore } from '@/store/authStore'
import { useTripStore } from '@/store/tripStore'
import { MOOD_OPTIONS } from '@/constants/onboarding'
import * as Haptics from 'expo-haptics'

export default function SettingsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { theme, setTheme, tokens } = useThemeStore()
  const { setMood, resetOnboarding } = useOnboardingStore()
  const { user, signOut } = useAuthStore()
  const { clearTrip } = useTripStore()

  const [locationGranted, setLocationGranted] = useState(false)
  const [notificationsGranted, setNotificationsGranted] = useState(false)

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then(({ status }) => setLocationGranted(status === 'granted'))
      .catch(() => {})

    Notifications.getPermissionsAsync()
      .then(({ status }) => setNotificationsGranted(status === 'granted'))
      .catch(() => {})
  }, [])

  const handleMoodChange = (mood: TravelMood) => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    setMood(mood)
    setTheme(mood)
  }

  const handleToggleLocation = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch {
      // Ignore
    }
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
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch {
      // Ignore
    }
    Alert.alert('Sign out?', "You'll need to sign in again to sync your trip.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/')
        },
      },
    ])
  }

  const handleClearTrip = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch {
      // Ignore
    }
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
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } catch {
      // Ignore
    }
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
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-canvas">
      {/* Page Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="font-sans font-medium text-[28px] text-text tracking-tight">
          Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 110,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Entry Point */}
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open user profile and travel preferences"
          className="bg-surface rounded-[24px] border border-border p-4 flex-row items-center justify-between active:opacity-85"
        >
          <View className="flex-row items-center gap-3.5 flex-1 min-w-0 mr-2">
            <ProfileAvatar size="md" />
            <View className="flex-1 min-w-0">
              <Text className="font-sans font-medium text-[17px] text-text" numberOfLines={1}>
                {user?.name || 'Explorer'}
              </Text>
              <Text className="font-sans text-xs text-muted mt-0.5" numberOfLines={1}>
                {user?.email || 'Profile & Travel Preferences'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            <Text className="font-sans font-medium text-xs text-primary">View</Text>
            <Ionicons name="chevron-forward" size={16} color={tokens.primary} />
          </View>
        </Pressable>

        {/* Travel Mood Section */}
        <View className="bg-surface rounded-[24px] border border-border p-5">
          <Text className="font-sans font-medium text-[18px] text-text">Travel mood</Text>
          <Text className="font-sans text-xs text-muted mt-0.5 mb-3.5">
            Tunes recommendations and theme accents without altering saved trips
          </Text>

          <View className="gap-2">
            {MOOD_OPTIONS.map((option) => {
              const isSelected = theme === option.value
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option.label} mood`}
                  className={`flex-row items-center p-3 rounded-[16px] border gap-3 active:opacity-80 ${
                    isSelected
                      ? 'border-primary bg-soft/70'
                      : 'border-border/60 bg-canvas/40'
                  }`}
                  onPress={() => handleMoodChange(option.value)}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-surface border border-border'
                    }`}
                  >
                    <Ionicons
                      name={option.icon}
                      size={16}
                      color={isSelected ? '#FFFFFF' : '#263F35'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-sans text-[14.5px] ${
                        isSelected ? 'font-medium text-text' : 'font-normal text-text'
                      }`}
                    >
                      {option.label}
                    </Text>
                    <Text className="font-sans text-[11.5px] text-muted">
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={tokens.primary} />
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* In-Place Planning Preferences */}
        <PreferenceSummary />

        {/* Permissions Group */}
        <View className="bg-surface rounded-[24px] border border-border p-5">
          <Text className="font-sans font-medium text-[18px] text-text">Permissions</Text>
          <Text className="font-sans text-xs text-muted mt-0.5 mb-2">
            Optional permissions for localized discovery and departure reminders
          </Text>

          <View className="divide-y divide-border/60">
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 mr-4">
                <Text className="font-sans font-medium text-[15px] text-text">Location</Text>
                <Text className="font-sans text-xs text-muted mt-0.5">
                  Used for sorting nearby destinations and discovery radius
                </Text>
              </View>
              <Switch
                value={locationGranted}
                onValueChange={handleToggleLocation}
                trackColor={{ false: '#E5E7DF', true: tokens.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-1 mr-4">
                <Text className="font-sans font-medium text-[15px] text-text">Notifications</Text>
                <Text className="font-sans text-xs text-muted mt-0.5">
                  Reminders for planned itineraries and curated inspiration
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

        {/* Data & Safety Management */}
        <View className="bg-surface rounded-[24px] border border-border p-5">
          <Text className="font-sans font-medium text-[18px] text-text mb-1">
            Data management
          </Text>

          <View className="divide-y divide-border/60">
            <Pressable
              onPress={handleResetPreferences}
              accessibilityRole="button"
              accessibilityLabel="Reset onboarding preferences"
              className="py-3.5 flex-row items-center justify-between active:opacity-60"
            >
              <View>
                <Text className="font-sans font-medium text-[15px] text-primary">
                  Reset travel preferences
                </Text>
                <Text className="font-sans text-xs text-muted mt-0.5">
                  Re-opens preference questionnaires without affecting your trip
                </Text>
              </View>
              <Ionicons name="refresh-outline" size={18} color={tokens.primary} />
            </Pressable>

            <Pressable
              onPress={handleClearTrip}
              accessibilityRole="button"
              accessibilityLabel="Clear all saved destinations from trip"
              className="py-3.5 flex-row items-center justify-between active:opacity-60"
            >
              <View>
                <Text className="font-sans font-medium text-[15px] text-[#D9534F]">
                  Clear my trip
                </Text>
                <Text className="font-sans text-xs text-muted mt-0.5">
                  Removes all saved itinerary stops from your device
                </Text>
              </View>
              <Ionicons name="trash-outline" size={18} color="#D9534F" />
            </Pressable>

            {user && (
              <Pressable
                onPress={handleSignOut}
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                className="py-3.5 flex-row items-center justify-between active:opacity-60"
              >
                <Text className="font-sans font-medium text-[15px] text-[#D9534F]">
                  Sign out
                </Text>
                <Ionicons name="log-out-outline" size={18} color="#D9534F" />
              </Pressable>
            )}
          </View>
        </View>

        <View className="py-2 items-center">
          <Text className="font-sans text-xs text-muted">Outta Travel Planner • v0.1.0</Text>
        </View>
      </ScrollView>
    </View>
  )
}
