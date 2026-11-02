'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  type TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore';
import { semanticColors } from '@/theme/colors';

interface AuthBottomSheetProps {
  visible: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
}

export function AuthBottomSheet({
  visible,
  initialMode = 'signup',
  onClose,
}: AuthBottomSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, loading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const emailRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const passwordRef = useRef<React.ElementRef<typeof TextInput>>(null);

  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      clearError();
      setNameError(null);
      setEmailError(null);
      setPasswordError(null);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          stiffness: 220,
          mass: 0.8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 600,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialMode]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 600,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const validate = (): boolean => {
    let valid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    clearError();

    if (mode === 'signup' && !name.trim()) {
      setNameError('Please enter your name');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Please enter your email');
      valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      valid = false;
    } else if (mode === 'signup' && password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (mode === 'signup') {
      const success = await signUp(email.trim(), password, name.trim());
      if (success) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        onClose();
        router.replace('/onboarding/mood');
      }
    } else {
      const success = await signIn(email.trim(), password);
      if (success) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
        onClose();
        const onboardingData = useOnboardingStore.getState().data;
        if (onboardingData.completed) {
          router.replace('/(tabs)/explore');
        } else {
          router.replace(getResumeStep(onboardingData));
        }
      }
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setMode(newMode);
    clearError();
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        {/* Backdrop Tint */}
        <Animated.View
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 bg-black/60"
        >
          <Pressable className="absolute inset-0" onPress={handleDismiss} />
        </Animated.View>

        {/* Sliding BottomSheet Panel */}
        <Animated.View
          style={{
            transform: [{ translateY }],
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          className="bg-card rounded-t-[32px] border-t border-border shadow-2xl max-h-[88%]"
        >
          {/* Top Pill Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1.5 rounded-full bg-border" />
          </View>

          {/* Header & Segmented Mode Switcher */}
          <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="font-sans font-medium text-[24px] text-foreground tracking-tight">
                {mode === 'signup' ? 'Create an account' : 'Welcome back'}
              </Text>
              <Text className="font-sans text-xs text-muted-foreground mt-0.5">
                {mode === 'signup'
                  ? 'Save your itineraries and access them anywhere.'
                  : 'Sign in to continue planning your trip.'}
              </Text>
            </View>

            <Pressable
              onPress={handleDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="p-1 -mr-1 active:opacity-60"
            >
              <Ionicons name="close-circle" size={26} color={semanticColors.mutedForeground} />
            </Pressable>
          </View>

          {/* Segmented Control Pill */}
          <View className="px-6 mb-5">
            <View className="flex-row p-1 bg-surface-muted rounded-full border border-border">
              <Pressable
                onPress={() => switchMode('signin')}
                className={`flex-1 py-2 items-center justify-center rounded-full ${
                  mode === 'signin' ? 'bg-card shadow-xs' : ''
                }`}
              >
                <Text
                  className={`font-sans text-[13px] font-medium ${
                    mode === 'signin' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                onPress={() => switchMode('signup')}
                className={`flex-1 py-2 items-center justify-center rounded-full ${
                  mode === 'signup' ? 'bg-card shadow-xs' : ''
                }`}
              >
                <Text
                  className={`font-sans text-[13px] font-medium ${
                    mode === 'signup' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Form Content */}
          <ScrollView
            className="px-6"
            contentContainerStyle={{ gap: 14, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <View className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={18} color={semanticColors.destructive} />
                <Text className="font-sans text-xs text-destructive flex-1">{error}</Text>
              </View>
            )}

            {mode === 'signup' && (
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={name}
                onChangeText={setName}
                error={nameError || undefined}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            )}

            <Input
              ref={emailRef}
              label="Email Address"
              placeholder="jane@example.com"
              value={email}
              onChangeText={setEmail}
              error={emailError || undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View className="relative">
              <Input
                ref={passwordRef}
                label="Password"
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                value={password}
                onChangeText={setPassword}
                error={passwordError || undefined}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="absolute right-3.5 top-[38px] p-1 active:opacity-60"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={semanticColors.mutedForeground}
                />
              </Pressable>
            </View>

            <View className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onPress={handleSubmit}
              >
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </Button>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
