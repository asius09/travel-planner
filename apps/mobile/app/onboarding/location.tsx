'use client';

import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { OnboardingLayout } from '@/components/ui';
import { semanticColors } from '@/theme/colors';

export default function LocationPermissionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleEnableLocation = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setStatusMessage('Location enabled ✓');
      }
    } catch {
      // Graceful fallback for mock or unsupported environments
    } finally {
      setLoading(false);
      setTimeout(() => {
        router.push('/onboarding/notifications');
      }, 200);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/notifications');
  };

  return (
    <OnboardingLayout
      title="Find places near you"
      currentStep={5}
      totalSteps={6}
      scrollable={false}
      primaryButtonText={statusMessage || 'Enable location'}
      primaryButtonLoading={loading}
      onPrimaryPress={handleEnableLocation}
      secondaryButtonText="Not now"
      onSecondaryPress={handleSkip}
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/onboarding/travel-party');
        }
      }}
    >
      <View className="flex-1 px-6 items-center justify-center" pointerEvents="none">
        <View className="items-center justify-center my-auto">
          <Ionicons name="location" size={76} color={semanticColors.primary} />

          {/* Supporting Copy */}
          <Text className="mt-8 max-w-[320px] text-center font-sans text-[15px] leading-6 text-foreground font-medium">
            Your location helps us find relevant places nearby. You stay in control.
          </Text>
          <Text className="mt-2.5 max-w-[300px] text-center font-sans text-[13px] leading-5 text-muted-foreground">
            Processed on-device only. Never tracked or sold.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}
