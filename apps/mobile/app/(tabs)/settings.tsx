'use client';

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileAvatar, PreferenceSummary } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { useTripStore } from '@/store/tripStore';
import { api } from '@/services/api';
import * as Haptics from 'expo-haptics';
import { semanticColors } from '@/theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { resetOnboarding } = useOnboardingStore();
  const { user, signOut } = useAuthStore();
  const { clearTrip } = useTripStore();

  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then(({ status }) => setLocationGranted(status === 'granted'))
      .catch(() => {});

    Notifications.getPermissionsAsync()
      .then(({ status }) => setNotificationsGranted(status === 'granted'))
      .catch(() => {});
  }, []);

  const handleToggleLocation = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (value) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationGranted(status === 'granted');
      } catch {
        setLocationGranted(false);
      }
    } else {
      setLocationGranted(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (value) {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        setNotificationsGranted(status === 'granted');
      } catch {
        setNotificationsGranted(false);
      }
    } else {
      setNotificationsGranted(false);
    }
  };

  const handleSignOut = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    Alert.alert('Sign out?', "You'll need to sign in again to sync your trip.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleClearTrip = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    Alert.alert(
      'Clear your trip?',
      'This will remove all destinations from your trip. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear trip',
          style: 'destructive',
          onPress: async () => {
            // Remove server-side first, then clear the local mirror so the
            // trip does not reappear on the next reconciliation.
            const destinationIds = useTripStore.getState().destinations.map(d => d.destinationId);
            await Promise.allSettled(destinationIds.map(id => api.removeTripItem(id)));
            clearTrip();
          },
        },
      ]
    );
  };

  const handleResetPreferences = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    Alert.alert(
      'Reset preferences?',
      'This will reset your travel preferences but keep your saved trip intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            // Clear the server answers too, otherwise the next launch would
            // restore the old preferences mid-onboarding.
            await api.resetPreferences().catch(() => {});
            resetOnboarding();
            router.replace('/onboarding/mood');
          },
        },
      ]
    );
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-background">
      {/* Page Header */}
      <View className="px-5 pb-2 pt-4">
        <Text className="font-sans text-[28px] font-medium tracking-tight text-foreground">
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
          accessibilityRole="button"
          accessibilityLabel="Open user profile and travel preferences"
          className="flex-row items-center justify-between rounded-[24px] border border-border bg-card p-4"
        >
          <View className="flex-row items-center gap-2.5">
            <ProfileAvatar size="md" />
            <View>
              <Text className="font-sans text-[17px] font-medium text-card-foreground">
                {user?.name || 'Explorer'}
              </Text>
              <Text className="font-sans text-[13px] text-muted-foreground">
                {user?.email || 'Profile & Travel Preferences'}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Travel Preferences */}
        <PreferenceSummary />

        {/* Permissions */}
        <View className="rounded-[24px] border border-border bg-card p-4">
          <View className="mb-3.5 flex-row items-center justify-between">
            <Text className="font-sans text-[18px] font-medium text-card-foreground">
              Permissions
            </Text>
          </View>

          <View className="mb-2.5 flex-row items-center justify-between rounded-[16px] border border-border bg-surface p-3.5">
            <View className="flex-1">
              <Text className="font-sans text-[15px] font-medium text-foreground">Location</Text>
            </View>
            <Switch
              value={locationGranted}
              onValueChange={handleToggleLocation}
              trackColor={{ false: semanticColors.border, true: semanticColors.primary }}
              thumbColor={semanticColors.white}
            />
          </View>

          <View className="flex-row items-center justify-between rounded-[16px] border border-border bg-surface p-3.5">
            <View className="flex-1">
              <Text className="font-sans text-[15px] font-medium text-foreground">
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsGranted}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: semanticColors.border, true: semanticColors.primary }}
              thumbColor={semanticColors.white}
            />
          </View>
        </View>

        {/* Data & Safety */}
        <View className="rounded-[24px] border border-border bg-card p-4">
          <Text className="mb-3.5 font-sans text-[18px] font-medium text-card-foreground">
            Data management
          </Text>

          <Pressable
            onPress={handleResetPreferences}
            className="mb-2.5 flex-row items-center justify-between rounded-[16px] border border-border bg-surface p-3.5 active:opacity-70"
          >
            <View>
              <Text className="font-sans text-[15px] font-medium text-primary">
                Reset travel preferences
              </Text>
            </View>
            <Ionicons name="refresh-outline" size={18} color={semanticColors.primary} />
          </Pressable>

          <Pressable
            onPress={handleClearTrip}
            className="mb-2.5 flex-row items-center justify-between rounded-[16px] border border-border bg-surface p-3.5 active:opacity-70"
          >
            <View>
              <Text className="font-sans text-[15px] font-medium text-destructive">
                Clear my trip
              </Text>
            </View>
            <Ionicons name="trash-outline" size={18} color={semanticColors.destructive} />
          </Pressable>

          {user && (
            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center justify-between rounded-[16px] border border-border bg-surface p-3.5 active:opacity-70"
            >
              <View>
                <Text className="font-sans text-[15px] font-medium text-destructive">Sign out</Text>
              </View>
              <Ionicons name="log-out-outline" size={18} color={semanticColors.destructive} />
            </Pressable>
          )}
        </View>

        <View className="mt-3 items-center">
          <Text className="font-sans text-xs text-muted-foreground">
            Outta Travel Planner • v0.1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
