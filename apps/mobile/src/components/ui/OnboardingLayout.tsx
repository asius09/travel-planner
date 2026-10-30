'use client'

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import { ProgressIndicator } from './ProgressIndicator'

interface OnboardingLayoutProps {
  title: string
  subtitle?: string
  currentStep?: number
  totalSteps?: number
  onBack?: () => void
  primaryButtonText?: string
  primaryButtonDisabled?: boolean
  primaryButtonLoading?: boolean
  onPrimaryPress?: () => void
  secondaryButtonText?: string
  onSecondaryPress?: () => void
  children: React.ReactNode
  scrollable?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
  hideFooter?: boolean
}

export function OnboardingLayout({
  title,
  subtitle,
  currentStep,
  totalSteps = 4,
  onBack,
  primaryButtonText = 'Continue',
  primaryButtonDisabled = false,
  primaryButtonLoading = false,
  onPrimaryPress,
  secondaryButtonText = 'Skip for now',
  onSecondaryPress,
  children,
  scrollable = true,
  contentContainerStyle,
  hideFooter = false,
}: OnboardingLayoutProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          className="flex-1"
          contentContainerStyle={[
            { flexGrow: 1, paddingBottom: 24 },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )
    }

    return (
      <View
        className="flex-1"
        style={contentContainerStyle}
      >
        {children}
      </View>
    )
  }

  return (
    <View
      className="flex-1 bg-canvas"
      style={{
        paddingTop: Math.max(insets.top, 16),
      }}
    >
      {/* Top Navigation Row: Back Button on left, Progress Indicator on right */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <Pressable
          onPress={handleBack}
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={12}
          className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-border/40"
        >
          <Ionicons name="arrow-back" size={24} color="#202822" />
        </Pressable>

        {currentStep && totalSteps ? (
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        ) : (
          <View className="w-10" />
        )}
      </View>

      {/* Screen Title & Subtitle */}
      <View className="px-6 mb-6">
        <Text className="font-sans font-medium text-[28px] tracking-tight text-text">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-sans text-[15px] text-muted leading-6 mt-1.5">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Main Content Area */}
      {renderContent()}

      {/* Fixed / Sticky Bottom Actions */}
      {!hideFooter && (
        <View
          className="px-6 pt-3 bg-canvas border-t border-border/40"
          style={{
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
          {onPrimaryPress && (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={onPrimaryPress}
              disabled={primaryButtonDisabled}
              loading={primaryButtonLoading}
            >
              {primaryButtonText}
            </Button>
          )}

          {secondaryButtonText && onSecondaryPress ? (
            <Pressable
              onPress={onSecondaryPress}
              accessibilityLabel={secondaryButtonText}
              accessibilityRole="button"
              hitSlop={8}
              className="py-3 items-center mt-1"
            >
              <Text className="font-sans text-[15px] text-muted font-medium">
                {secondaryButtonText}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  )
}

