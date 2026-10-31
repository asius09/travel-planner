'use client'

import React, { useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { TravelMood, Duration, Budget, TravelParty } from '@travel-planner/shared'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useThemeStore } from '@/store/themeStore'
import { api } from '@/services/api'
import {
  MOOD_OPTIONS,
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
  TRAVEL_PARTY_OPTIONS,
  type IoniconName,
} from '@/constants/onboarding'
import * as Haptics from 'expo-haptics'

type PreferenceKey = 'mood' | 'duration' | 'budget' | 'travelParty'

/** Maps each preference key to the exact value type its store setter accepts. */
type PreferenceValue = {
  mood: TravelMood
  duration: Duration
  budget: Budget
  travelParty: TravelParty
}

export function PreferenceSummary({ className = '' }: { className?: string }) {
  const { data: preferences, setMood, setDuration, setBudget, setTravelParty } = useOnboardingStore()
  const { theme, setTheme, tokens } = useThemeStore()

  const [activeEditor, setActiveEditor] = useState<PreferenceKey | null>(null)

  // Current values
  const currentMood = theme || preferences.mood || 'nature'
  const currentDuration = preferences.duration || 'flexible'
  const currentBudget = preferences.budget || 'balanced'
  const currentParty = preferences.travelParty || 'solo'

  const moodOption = MOOD_OPTIONS.find((o) => o.value === currentMood) || MOOD_OPTIONS[0]
  const durationOption =
    DURATION_OPTIONS.find((o) => o.value === currentDuration) || DURATION_OPTIONS[0]
  const budgetOption = BUDGET_OPTIONS.find((o) => o.value === currentBudget) || BUDGET_OPTIONS[0]
  const partyOption =
    TRAVEL_PARTY_OPTIONS.find((o) => o.value === currentParty) || TRAVEL_PARTY_OPTIONS[0]

  const handleSelectPreference = async <K extends PreferenceKey>(
    key: K,
    value: PreferenceValue[K]
  ) => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }

    if (key === 'mood') {
      // Narrowed to TravelMood by the `key === 'mood'` check.
      const mood = value as TravelMood
      setMood(mood)
      setTheme(mood)
    } else if (key === 'duration') {
      setDuration(value as Duration)
    } else if (key === 'budget') {
      setBudget(value as Budget)
    } else if (key === 'travelParty') {
      setTravelParty(value as TravelParty)
    }

    setActiveEditor(null)

    // Sync to server in background
    try {
      await api.savePreferences({
        travelMood: key === 'mood' ? (value as TravelMood) : currentMood,
        duration: key === 'duration' ? (value as Duration) : currentDuration,
        budget: key === 'budget' ? (value as Budget) : currentBudget,
        travelParty: key === 'travelParty' ? (value as TravelParty) : currentParty,
      })
    } catch {
      // Retain local state
    }
  }

  const renderPreferenceRow = (
    key: PreferenceKey,
    title: string,
    currentLabel: string,
    icon: IoniconName,
    subtitle?: string
  ) => {
    return (
      <Pressable
        key={key}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          } catch {
            // Ignore
          }
          setActiveEditor(key)
        }}
        accessibilityRole="button"
        accessibilityLabel={`Change ${title}: currently ${currentLabel}`}
        className="flex-row items-center justify-between py-3 px-4 rounded-[16px] bg-canvas/60 border border-border/70 active:opacity-75 mb-2.5"
      >
        <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-2">
          <View className="w-8 h-8 rounded-full bg-surface border border-border items-center justify-center">
            <Ionicons name={icon} size={16} color={tokens.primary} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="font-sans text-[12px] text-muted">{title}</Text>
            <Text className="font-sans font-medium text-[15px] text-text" numberOfLines={1}>
              {currentLabel}
            </Text>
            {subtitle ? (
              <Text className="font-sans text-[11px] text-muted" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center gap-1">
          <Text className="font-sans text-xs text-primary font-medium">Edit</Text>
          <Ionicons name="chevron-forward" size={14} color={tokens.primary} />
        </View>
      </Pressable>
    )
  }

  return (
    <View className={`bg-surface rounded-[24px] border border-border p-5 ${className}`}>
      <View className="flex-row items-center justify-between mb-3.5">
        <View>
          <Text className="font-sans font-medium text-[18px] text-text">Travel preferences</Text>
          <Text className="font-sans text-[13px] text-muted mt-0.5">
            Personalizes discovery without altering your saved trip
          </Text>
        </View>
      </View>

      <View className="pt-1">
        {renderPreferenceRow(
          'mood',
          'Travel mood',
          moodOption.label,
          'compass-outline',
          moodOption.description
        )}
        {renderPreferenceRow(
          'duration',
          'Preferred duration',
          durationOption.label,
          'calendar-outline',
          durationOption.description
        )}
        {renderPreferenceRow(
          'budget',
          'Budget range',
          budgetOption.label,
          'wallet-outline',
          budgetOption.description
        )}
        {renderPreferenceRow(
          'travelParty',
          'Travel party',
          partyOption.label,
          'people-outline',
          partyOption.description
        )}
      </View>

      {/* Lightweight In-Place Editor Modal */}
      <Modal
        visible={activeEditor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveEditor(null)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setActiveEditor(null)}
        >
          <Pressable
            className="bg-surface rounded-t-[32px] p-6 max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-10 h-1 rounded-full bg-border self-center mb-4" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-sans font-medium text-[20px] text-text">
                {activeEditor === 'mood' && 'Select travel mood'}
                {activeEditor === 'duration' && 'Select trip duration'}
                {activeEditor === 'budget' && 'Select budget range'}
                {activeEditor === 'travelParty' && 'Select travel party'}
              </Text>
              <Pressable
                onPress={() => setActiveEditor(null)}
                className="p-1 active:opacity-60"
                accessibilityLabel="Close"
              >
                <Ionicons name="close-circle" size={24} color="#777F78" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="gap-2.5">
              {activeEditor === 'mood' &&
                MOOD_OPTIONS.map((opt) => {
                  const isSelected = currentMood === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('mood', opt.value)}
                      className={`p-4 rounded-[16px] border flex-row items-center justify-between ${
                        isSelected
                          ? 'bg-soft border-primary'
                          : 'bg-surface border-border active:bg-canvas'
                      }`}
                    >
                      <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-2">
                        <View
                          className={`w-9 h-9 rounded-full items-center justify-center ${
                            isSelected ? 'bg-primary' : 'bg-canvas border border-border'
                          }`}
                        >
                          <Ionicons
                            name={opt.icon}
                            size={18}
                            color={isSelected ? '#FFFFFF' : '#202822'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-sans text-[15px] ${
                              isSelected ? 'font-medium text-text' : 'font-normal text-text'
                            }`}
                          >
                            {opt.label}
                          </Text>
                          <Text className="font-sans text-xs text-muted mt-0.5">
                            {opt.description}
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={tokens.primary} />
                      )}
                    </Pressable>
                  )
                })}

              {activeEditor === 'duration' &&
                DURATION_OPTIONS.map((opt) => {
                  const isSelected = currentDuration === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('duration', opt.value)}
                      className={`p-4 rounded-[16px] border flex-row items-center justify-between ${
                        isSelected
                          ? 'bg-soft border-primary'
                          : 'bg-surface border-border active:bg-canvas'
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text
                          className={`font-sans text-[15px] ${
                            isSelected ? 'font-medium text-text' : 'font-normal text-text'
                          }`}
                        >
                          {opt.label}
                        </Text>
                        <Text className="font-sans text-xs text-muted mt-0.5">
                          {opt.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={tokens.primary} />
                      )}
                    </Pressable>
                  )
                })}

              {activeEditor === 'budget' &&
                BUDGET_OPTIONS.map((opt) => {
                  const isSelected = currentBudget === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('budget', opt.value)}
                      className={`p-4 rounded-[16px] border flex-row items-center justify-between ${
                        isSelected
                          ? 'bg-soft border-primary'
                          : 'bg-surface border-border active:bg-canvas'
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text
                          className={`font-sans text-[15px] ${
                            isSelected ? 'font-medium text-text' : 'font-normal text-text'
                          }`}
                        >
                          {opt.label}
                        </Text>
                        <Text className="font-sans text-xs text-muted mt-0.5">
                          {opt.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={tokens.primary} />
                      )}
                    </Pressable>
                  )
                })}

              {activeEditor === 'travelParty' &&
                TRAVEL_PARTY_OPTIONS.map((opt) => {
                  const isSelected = currentParty === opt.value
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('travelParty', opt.value)}
                      className={`p-4 rounded-[16px] border flex-row items-center justify-between ${
                        isSelected
                          ? 'bg-soft border-primary'
                          : 'bg-surface border-border active:bg-canvas'
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text
                          className={`font-sans text-[15px] ${
                            isSelected ? 'font-medium text-text' : 'font-normal text-text'
                          }`}
                        >
                          {opt.label}
                        </Text>
                        <Text className="font-sans text-xs text-muted mt-0.5">
                          {opt.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={tokens.primary} />
                      )}
                    </Pressable>
                  )
                })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
