'use client'

import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ProfileAvatar, TripSummary, PreferenceSummary, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import * as Haptics from 'expo-haptics'

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user, setUser, session, signOut } = useAuthStore()
  const { tokens } = useThemeStore()

  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(user?.name || '')

  const handleBack = () => {
    try {
      Haptics.selectionAsync()
    } catch {
      // Ignore
    }
    router.back()
  }

  const handleSaveName = () => {
    if (user) {
      setUser(
        {
          ...user,
          name: editedName.trim() || null,
        },
        session
      )
    }
    setIsEditingName(false)
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

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-canvas">
      {/* Top Navigation Row */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between border-b border-border/40">
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back to previous screen"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#202822" />
        </Pressable>

        <Text className="font-sans font-medium text-[17px] text-text">Profile</Text>

        <View className="w-10" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60, gap: 20 }}
      >
        {/* User Identity Bento Card with Theme-Derived Avatar */}
        <View className="bg-surface rounded-[24px] border border-border p-6 items-center">
          <ProfileAvatar size="xl" className="mb-4" />

          <View className="items-center">
            <Text className="font-sans font-medium text-[22px] text-text text-center">
              {user?.name || 'Explorer'}
            </Text>
            <Text className="font-sans text-[14px] text-muted text-center mt-0.5">
              {user?.email || 'No email registered'}
            </Text>
          </View>

          {/* Edit Name Trigger */}
          <Pressable
            onPress={() => {
              setEditedName(user?.name || '')
              setIsEditingName(true)
            }}
            accessibilityRole="button"
            accessibilityLabel="Edit display name"
            className="mt-4 px-4 py-1.5 rounded-full bg-canvas border border-border flex-row items-center gap-1.5 active:opacity-75"
          >
            <Ionicons name="pencil-outline" size={13} color="#777F78" />
            <Text className="font-sans font-medium text-xs text-text">Edit name</Text>
          </Pressable>
        </View>

        {/* Active Itinerary Bento Summary Card */}
        <View>
          <Text className="font-sans font-medium text-[16px] text-text mb-2.5 px-1">
            Active itinerary
          </Text>
          <TripSummary />
        </View>

        {/* Travel Preferences Section */}
        <View>
          <Text className="font-sans font-medium text-[16px] text-text mb-2.5 px-1">
            Travel preferences
          </Text>
          <PreferenceSummary />
        </View>

        {/* Account & Sign out */}
        <View className="pt-2">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onPress={handleSignOut}
            className="border-statusError/40"
            textClassName="text-statusError"
          >
            Sign out
          </Button>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={isEditingName}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingName(false)}
      >
        <Pressable
          onPress={() => setIsEditingName(false)}
          className="flex-1 bg-black/40 justify-center px-6"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-surface rounded-[24px] border border-border p-6 gap-4"
          >
            <Text className="font-sans font-medium text-[18px] text-text">
              Edit display name
            </Text>

            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Your name"
              placeholderTextColor="#777F78"
              autoFocus
              className="font-sans text-[16px] text-text py-3 px-4 rounded-[14px] bg-canvas border border-border"
            />

            <View className="flex-row gap-3 pt-2">
              <View className="flex-1">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onPress={() => setIsEditingName(false)}
                >
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onPress={handleSaveName}
                >
                  Save
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
