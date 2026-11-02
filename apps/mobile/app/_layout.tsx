import '@/polyfills';
import './global.css';
import { useEffect, useRef } from 'react';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { Providers } from '@/components/Providers';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore';
import { semanticColors } from '@/theme/colors';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isInitialized: isAuthReady, restoreSession } = useAuthStore();
  const { data: onboardingData, isInitialized: isOnboardingReady } = useOnboardingStore();
  const pendingTargetRef = useRef<string | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    // Wait until both Auth and Onboarding AsyncStorage states have rehydrated
    // to prevent any flash of onboarding or unauthenticated states on cold boot.
    if (!isAuthReady || !isOnboardingReady) return;

    const segs = segments as unknown as string[];
    const rootSegment = segs[0] as string | undefined;
    const subSegment = segs[1] as string | undefined;
    const inAuthGroup = rootSegment === 'auth';
    const inWelcome = !rootSegment || rootSegment === 'index';
    const inOnboardingGroup = rootSegment === 'onboarding';
    const inProtectedGroup =
      rootSegment === '(tabs)' || rootSegment === 'destination' || rootSegment === 'profile';

    const isAuthenticated = !!user;
    const isOnboardingComplete = onboardingData.completed;

    let targetRoute: string | null = null;

    if (!isAuthenticated) {
      if (inOnboardingGroup || inProtectedGroup) {
        targetRoute = '/';
      }
    } else {
      if (!isOnboardingComplete) {
        if (inWelcome || inAuthGroup) {
          targetRoute = getResumeStep(onboardingData);
        }
      } else {
        if (inWelcome || inAuthGroup) {
          targetRoute = '/(tabs)/explore';
        }
      }
    }

    if (!targetRoute) {
      pendingTargetRef.current = null;
      return;
    }

    // Guard: Prevent double-navigation if already at or actively transitioning to target
    if (pendingTargetRef.current === targetRoute) return;
    if (targetRoute === '/' && inWelcome) {
      pendingTargetRef.current = null;
      return;
    }
    if (targetRoute === '/(tabs)/explore' && rootSegment === '(tabs)') {
      pendingTargetRef.current = null;
      return;
    }
    if (rootSegment === 'onboarding' && targetRoute === `/onboarding/${subSegment}`) {
      pendingTargetRef.current = null;
      return;
    }

    pendingTargetRef.current = targetRoute;
    router.replace(targetRoute as any);
  }, [user, onboardingData.completed, isAuthReady, isOnboardingReady, segments]);

  return null;
}

export default function RootLayout() {
  const isAuthReady = useAuthStore(s => s.isInitialized);
  const isOnboardingReady = useOnboardingStore(s => s.isInitialized);

  const [fontsLoaded, fontError] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
    Geist_Regular: require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
    Geist_Medium: require('../assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
    Geist_SemiBold: require('../assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
    Geist_Bold: require('../assets/fonts/Geist-Bold.ttf'),
  });

  // Hide native splash screen ONLY once fonts, auth, and onboarding states are fully ready
  // This guarantees zero momentary flash of onboarding or intermediate routes on cold boot.
  useEffect(() => {
    if ((fontsLoaded || fontError) && isAuthReady && isOnboardingReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, isAuthReady, isOnboardingReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Providers>
      <NavigationGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: semanticColors.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none', gestureEnabled: false }} />
        <Stack.Screen name="auth/signin" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="onboarding/mood" />
        <Stack.Screen name="onboarding/duration" />
        <Stack.Screen name="onboarding/budget" />
        <Stack.Screen name="onboarding/travel-party" />
        <Stack.Screen name="onboarding/location" />
        <Stack.Screen name="onboarding/notifications" />
        <Stack.Screen
          name="onboarding/personalizing"
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="onboarding/permissions" />
        <Stack.Screen name="(tabs)" options={{ animation: 'ios_from_left', gestureEnabled: false }} />
        <Stack.Screen name="destination/[id]" />
      </Stack>
    </Providers>
  );
}
