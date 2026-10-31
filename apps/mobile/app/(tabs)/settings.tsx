'use client';

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileAvatar, PreferenceSummary } from '@/components/ui';
import { useThemeStore } from '@/store/themeStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { useTripStore } from '@/store/tripStore';
import * as Haptics from 'expo-haptics';
import { semanticColors } from '@/theme/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens } = useThemeStore();
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
          onPress: () => {
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
          onPress: () => {
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
        <Text className="font-sans text-[28px] font-medium tracking-tight text-foreground">Settings</Text>
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
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#E7E3DB',
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ProfileAvatar size="md" />
            <View>
              <Text style={{ fontFamily: 'Geist', fontSize: 17, fontWeight: '500', color: '#252B2D' }}>
                {user?.name || 'Explorer'}
              </Text>
              <Text style={{ fontFamily: 'Geist', fontSize: 13, color: '#454B4D' }}>
                {user?.email || 'Profile & Travel Preferences'}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#454B4D" />
        </Pressable>

        {/* Travel Preferences */}
        <PreferenceSummary />

        {/* Permissions */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ fontFamily: 'Geist', fontSize: 18, fontWeight: '500', color: '#252B2D' }}>Permissions</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E3DB', padding: 14, marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Geist', fontSize: 15, fontWeight: '500', color: '#252B2D' }}>Location</Text>
            </View>
            <Switch
              value={locationGranted}
              onValueChange={handleToggleLocation}
              trackColor={{ false: semanticColors.border, true: tokens.primary }}
              thumbColor={semanticColors.white}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E3DB', padding: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Geist', fontSize: 15, fontWeight: '500', color: '#252B2D' }}>Notifications</Text>
            </View>
            <Switch
              value={notificationsGranted}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: semanticColors.border, true: tokens.primary }}
              thumbColor={semanticColors.white}
            />
          </View>
        </View>

        {/* Data & Safety */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16 }}>
          <Text style={{ fontFamily: 'Geist', fontSize: 18, fontWeight: '500', color: '#252B2D', marginBottom: 14 }}>
            Data management
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E3DB', padding: 14, marginBottom: 10 }}>
            <View>
              <Text style={{ fontFamily: 'Geist', fontSize: 15, fontWeight: '500', color: tokens.primary }}>
                Reset travel preferences
              </Text>
            </View>
            <Ionicons name="refresh-outline" size={18} color={tokens.primary} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E3DB', padding: 14, marginBottom: 10 }}>
            <View>
              <Text style={{ fontFamily: 'Geist', fontSize: 15, fontWeight: '500', color: '#B42318' }}>
                Clear my trip
              </Text>
            </View>
            <Ionicons name="trash-outline" size={18} color="#B42318" />
          </View>

          {user && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E7E3DB', padding: 14 }}>
              <View>
                <Text style={{ fontFamily: 'Geist', fontSize: 15, fontWeight: '500', color: '#B42318' }}>
                  Sign out
                </Text>
              </View>
              <Ionicons name="log-out-outline" size={18} color="#B42318" />
            </View>
          )}
        </View>

        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <Text style={{ fontFamily: 'Geist', fontSize: 12, color: '#454B4D' }}>
            Outta Travel Planner • v0.1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}