'use client';

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TravelMood, Duration, Budget, TravelParty } from '@travel-planner/shared';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useThemeStore } from '@/store/themeStore';
import { api } from '@/services/api';
import {
  MOOD_OPTIONS,
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
  TRAVEL_PARTY_OPTIONS,
  type IoniconName,
} from '@/constants/onboarding';
import * as Haptics from 'expo-haptics';

type PreferenceKey = 'mood' | 'duration' | 'budget' | 'travelParty';

type PreferenceValue = {
  mood: TravelMood;
  duration: Duration;
  budget: Budget;
  travelParty: TravelParty;
};

export function PreferenceSummary({ className = '' }: { className?: string }) {
  const {
    data: preferences,
    setMood,
    setDuration,
    setBudget,
    setTravelParty,
  } = useOnboardingStore();
  const { theme, setTheme, tokens } = useThemeStore();

  const [activeEditor, setActiveEditor] = useState<PreferenceKey | null>(null);

  const currentMood = theme || preferences.mood || 'nature';
  const currentDuration = preferences.duration || 'flexible';
  const currentBudget = preferences.budget || 'balanced';
  const currentParty = preferences.travelParty || 'solo';

  const moodOption = MOOD_OPTIONS.find((o) => o.value === currentMood) ?? MOOD_OPTIONS[0];
  const durationOption =
    DURATION_OPTIONS.find((o) => o.value === currentDuration) ?? DURATION_OPTIONS[0];
  const budgetOption = BUDGET_OPTIONS.find((o) => o.value === currentBudget) ?? BUDGET_OPTIONS[0];
  const partyOption =
    TRAVEL_PARTY_OPTIONS.find((o) => o.value === currentParty) ?? TRAVEL_PARTY_OPTIONS[0];

  const handleSelectPreference = async <K extends PreferenceKey>(
    key: K,
    value: PreferenceValue[K]
  ) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Ignore
    }

    if (key === 'mood') {
      const mood = value as TravelMood;
      setMood(mood);
      setTheme(mood);
    } else if (key === 'duration') {
      setDuration(value as Duration);
    } else if (key === 'budget') {
      setBudget(value as Budget);
    } else if (key === 'travelParty') {
      setTravelParty(value as TravelParty);
    }

    setActiveEditor(null);

    try {
      await api.savePreferences({
        travelMood: key === 'mood' ? (value as TravelMood) : currentMood,
        duration: key === 'duration' ? (value as Duration) : currentDuration,
        budget: key === 'budget' ? (value as Budget) : currentBudget,
        travelParty: key === 'travelParty' ? (value as TravelParty) : currentParty,
      });
    } catch {}
  };

  const renderPreferenceRow = (
    key: PreferenceKey,
    title: string,
    currentLabel: string,
    icon: IoniconName
  ) => {
    return (
      <Pressable
        key={key}
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          setActiveEditor(key);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Change ${title}: currently ${currentLabel}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E7E3DB',
          padding: 14,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#E7E3DB',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={icon} size={18} color="#454B4D" />
          </View>
          <View>
            <Text style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: '500', color: '#252B2D' }}>
              {title}
            </Text>
            <Text style={{ fontFamily: 'Geist', fontSize: 13, color: '#454B4D' }}>
              {currentLabel}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#454B4D" />
      </Pressable>
    );
  };

  return (
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
      <Text style={{ fontFamily: 'Geist', fontSize: 18, fontWeight: '500', color: '#252B2D', marginBottom: 14 }}>
        Travel preferences
      </Text>

      {renderPreferenceRow('mood', 'Travel mood', moodOption.label, 'compass-outline')}
      {renderPreferenceRow('duration', 'Trip duration', durationOption.label, 'calendar-outline')}
      {renderPreferenceRow('budget', 'Budget range', budgetOption.label, 'wallet-outline')}
      {renderPreferenceRow('travelParty', 'Travel party', partyOption.label, 'people-outline')}

      {/* Lightweight In-Place Editor Modal */}
      <Modal
        visible={activeEditor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveEditor(null)}
      >
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setActiveEditor(null)}>
          <Pressable
            className="max-h-[80%] rounded-t-[32px] bg-surface p-6"
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E7E3DB', alignSelf: 'center', marginBottom: 16 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Geist', fontSize: 18, fontWeight: '500', color: '#252B2D' }}>
                {activeEditor === 'mood' && 'Select travel mood'}
                {activeEditor === 'duration' && 'Select trip duration'}
                {activeEditor === 'budget' && 'Select budget range'}
                {activeEditor === 'travelParty' && 'Select travel party'}
              </Text>
              <Pressable onPress={() => setActiveEditor(null)} accessibilityLabel="Close">
                <Ionicons name="close-circle" size={24} color="#454B4D" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeEditor === 'mood' &&
                MOOD_OPTIONS.map((opt) => {
                  const isSelected = currentMood === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('mood', opt.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? tokens.primary : '#FFFFFF',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isSelected ? tokens.primary : '#E7E3DB',
                        padding: 14,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 10,
                            backgroundColor: isSelected ? tokens.primaryForeground : '#FFFFFF',
                            borderWidth: 1,
                            borderColor: isSelected ? tokens.primaryForeground : '#E7E3DB',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name={opt.icon} size={16} color={isSelected ? tokens.primary : '#454B4D'} />
                        </View>
                        <View>
                          <Text style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: '500', color: isSelected ? tokens.primaryForeground : '#252B2D' }}>
                            {opt.label}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={tokens.primaryForeground} />}
                    </Pressable>
                  );
                })}

              {activeEditor === 'duration' &&
                DURATION_OPTIONS.map((opt) => {
                  const isSelected = currentDuration === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('duration', opt.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? tokens.primary : '#FFFFFF',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isSelected ? tokens.primary : '#E7E3DB',
                        padding: 14,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: '500', color: isSelected ? tokens.primaryForeground : '#252B2D' }}>
                            {opt.label}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={tokens.primaryForeground} />}
                    </Pressable>
                  );
                })}

              {activeEditor === 'budget' &&
                BUDGET_OPTIONS.map((opt) => {
                  const isSelected = currentBudget === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('budget', opt.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? tokens.primary : '#FFFFFF',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isSelected ? tokens.primary : '#E7E3DB',
                        padding: 14,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: '500', color: isSelected ? tokens.primaryForeground : '#252B2D' }}>
                            {opt.label}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={tokens.primaryForeground} />}
                    </Pressable>
                  );
                })}

              {activeEditor === 'travelParty' &&
                TRAVEL_PARTY_OPTIONS.map((opt) => {
                  const isSelected = currentParty === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => handleSelectPreference('travelParty', opt.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected ? tokens.primary : '#FFFFFF',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isSelected ? tokens.primary : '#E7E3DB',
                        padding: 14,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'Geist', fontSize: 14, fontWeight: '500', color: isSelected ? tokens.primaryForeground : '#252B2D' }}>
                            {opt.label}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={tokens.primaryForeground} />}
                    </Pressable>
                  );
                })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}