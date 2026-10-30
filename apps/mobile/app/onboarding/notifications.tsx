'use client'

import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import { OnboardingLayout } from '@/components/ui'
import { useOnboardingStore } from '@/store/onboardingStore'

interface PreviewNotification {
  id: string
  title: string
  body: string
  time: string
  icon: keyof typeof Ionicons.glyphMap
  iconBg: string
  iconColor: string
}

const PREVIEW_NOTIFICATIONS: PreviewNotification[] = [
  {
    id: '1',
    title: 'Trip countdown',
    body: '5 days until your weekend in Kyoto',
    time: '2m ago',
    icon: 'calendar',
    iconBg: '#E8EBDD',
    iconColor: '#263F35',
  },
  {
    id: '2',
    title: 'Best season to visit',
    body: 'Ideal weather window for Amalfi Coast begins next month',
    time: '1h ago',
    icon: 'sparkles',
    iconBg: '#F1E6D5',
    iconColor: '#963F32',
  },
  {
    id: '3',
    title: 'Packing reminder',
    body: 'Light layers recommended for mild evening breezes',
    time: 'Yesterday',
    icon: 'briefcase',
    iconBg: '#DCEEF0',
    iconColor: '#176C70',
  },
]

export default function NotificationsPermissionScreen() {
  const router = useRouter()
  const { completeOnboarding } = useOnboardingStore()
  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleFinish = async () => {
    await completeOnboarding()
    router.replace('/(tabs)/explore')
  }

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      const { status } = await Notifications.requestPermissionsAsync()
      if (status === 'granted') {
        setStatusMessage('Notifications enabled ✓')
      }
    } catch {
      // Graceful fallback for mock or unsupported environments
    } finally {
      setLoading(false)
      setTimeout(async () => {
        await handleFinish()
      }, 250)
    }
  }

  const handleSkip = async () => {
    await handleFinish()
  }

  return (
    <OnboardingLayout
      title="Stay on top of your trip"
      subtitle="Get helpful reminders for the trips you plan. No spam, ever."
      primaryButtonText={statusMessage || 'Enable notifications'}
      primaryButtonLoading={loading}
      onPrimaryPress={handleEnableNotifications}
      secondaryButtonText="Maybe later"
      onSecondaryPress={handleSkip}
    >
      <View className="px-6 flex-1 justify-center py-2">
        {/* Soft Bell Icon Badge (inspired by reference image) */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-surface border border-border items-center justify-center shadow-sm">
            <Ionicons name="notifications-outline" size={30} color="#263F35" />
          </View>
        </View>

        {/* Stacked Realistic Notification Preview Cards */}
        <View className="bg-surface/60 rounded-[28px] border border-border/80 p-4 gap-3 shadow-sm">
          {PREVIEW_NOTIFICATIONS.map((item) => (
            <View
              key={item.id}
              className="bg-surface rounded-[20px] p-4 border border-border shadow-xs flex-row items-center gap-3.5"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: item.iconBg }}
              >
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans font-semibold text-[15px] text-text">
                    {item.title}
                  </Text>
                  <Text className="font-sans text-[11px] text-muted">
                    {item.time}
                  </Text>
                </View>
                <Text
                  className="font-sans text-[13px] text-muted mt-0.5 leading-4"
                  numberOfLines={2}
                >
                  {item.body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Reassurance note */}
        <View className="mt-6 items-center">
          <Text className="font-sans text-xs text-muted text-center px-4">
            You can customize or silence notifications anytime in your account settings.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  )
}

