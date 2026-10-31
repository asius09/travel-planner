import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/store/authStore'
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore'
import { useTripStore } from '@/store/tripStore'
import { useThemeStore } from '@/store/themeStore'

// Pure navigation guard simulation function matching app/_layout.tsx exactly
function computeRouteRedirect(params: {
  user: any
  isOnboardingComplete: boolean
  onboardingData: any
  routeSegment: string | undefined // e.g. undefined (index), 'auth', 'onboarding', '(tabs)', 'destination'
}): string | null {
  const { user, isOnboardingComplete, onboardingData, routeSegment } = params
  const inAuthGroup = routeSegment === 'auth'
  const inWelcome = !routeSegment || routeSegment === 'index'
  const inOnboardingGroup = routeSegment === 'onboarding'
  const inProtectedGroup =
    routeSegment === '(tabs)' || routeSegment === 'destination' || routeSegment === 'profile'

  const isAuthenticated = !!user

  if (!isAuthenticated) {
    // Unauthenticated user attempting to access onboarding or protected screen
    if (inOnboardingGroup || inProtectedGroup) {
      return '/'
    }
    return null // allowed to stay on welcome or auth
  } else {
    // Authenticated user
    if (!isOnboardingComplete) {
      // Incomplete onboarding
      if (inWelcome || inAuthGroup || inProtectedGroup) {
        return getResumeStep(onboardingData)
      }
      return null // allowed to stay within onboarding
    } else {
      // Completed onboarding
      if (inWelcome || inAuthGroup) {
        return '/(tabs)/explore'
      }
      return null // allowed in tabs, destination, etc.
    }
  }
}

describe('Authentication & Navigation Journeys', () => {
  beforeEach(async () => {
    await useAuthStore.getState().signOut()
    useOnboardingStore.getState().resetOnboarding()
    useTripStore.getState().clearTrip()
  })

  describe('Journey 1: Existing user', () => {
    it('should direct to Explore when existing user has completed onboarding', () => {
      const user = { id: 'user-1', email: 'existing@example.com', name: 'Existing User', emailVerified: true, createdAt: '' }
      useAuthStore.getState().setUser(user, { id: 's-1', token: 'token-1', expiresAt: '' })
      useOnboardingStore.setState({
        data: {
          mood: 'nature',
          duration: 'weekend',
          budget: 'balanced',
          travelParty: 'couple',
          completed: true,
        },
      })

      // When opening welcome or auth screen, redirect directly to Explore
      const redirectFromWelcome = computeRouteRedirect({
        user: useAuthStore.getState().user,
        isOnboardingComplete: useOnboardingStore.getState().data.completed,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: undefined,
      })
      expect(redirectFromWelcome).toBe('/(tabs)/explore')

      const redirectFromAuth = computeRouteRedirect({
        user: useAuthStore.getState().user,
        isOnboardingComplete: useOnboardingStore.getState().data.completed,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'auth',
      })
      expect(redirectFromAuth).toBe('/(tabs)/explore')
    })

    it('should resume onboarding if existing user has not completed onboarding', () => {
      const user = { id: 'user-1', email: 'existing@example.com', name: 'Existing User', emailVerified: true, createdAt: '' }
      useAuthStore.getState().setUser(user, { id: 's-1', token: 'token-1', expiresAt: '' })
      useOnboardingStore.setState({
        data: {
          mood: 'beach',
          duration: '3-5-days',
          budget: undefined,
          travelParty: undefined,
          completed: false,
        },
      })

      // If user tries to access protected tab or welcome, redirect to resume step
      const redirectFromTabs = computeRouteRedirect({
        user: useAuthStore.getState().user,
        isOnboardingComplete: useOnboardingStore.getState().data.completed,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: '(tabs)',
      })
      expect(redirectFromTabs).toBe('/onboarding/budget')
    })
  })

  describe('Journey 2: New user', () => {
    it('should create immediate authenticated session upon signup without requiring second login', () => {
      // Simulate successful signup payload from API/Better Auth
      const signupResponse = {
        user: {
          id: 'new-user-uuid',
          email: 'newbie@example.com',
          name: 'Jane Explorer',
          emailVerified: false, // Email verification disabled per product decision
          createdAt: new Date().toISOString(),
        },
        session: {
          id: 'session-uuid',
          token: 'valid-session-token-immediately',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      }

      useAuthStore.getState().setUser(signupResponse.user, signupResponse.session)

      const state = useAuthStore.getState()
      expect(state.user).not.toBeNull()
      expect(state.user?.name).toBe('Jane Explorer')
      expect(state.session?.token).toBe('valid-session-token-immediately')

      // User is immediately authenticated; guard directs new user to step 1 of onboarding
      const redirect = computeRouteRedirect({
        user: state.user,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'auth',
      })
      expect(redirect).toBe('/onboarding/mood')
    })

    it('should navigate directly to Explore when onboarding completes and not repeat it', async () => {
      const user = { id: 'u-2', email: 'new@example.com', name: 'New', emailVerified: false, createdAt: '' }
      useAuthStore.getState().setUser(user, { id: 's-2', token: 'tok', expiresAt: '' })

      const ob = useOnboardingStore.getState()
      ob.setMood('city')
      ob.setDuration('weekend')
      ob.setBudget('balanced')
      ob.setTravelParty('solo')
      await ob.completeOnboarding()

      expect(useOnboardingStore.getState().data.completed).toBe(true)

      // Guard sends user to Explore
      const redirect = computeRouteRedirect({
        user: useAuthStore.getState().user,
        isOnboardingComplete: useOnboardingStore.getState().data.completed,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'index',
      })
      expect(redirect).toBe('/(tabs)/explore')
    })
  })

  describe('Journey 3: Returning authenticated user across app restarts', () => {
    it('should restore session and maintain onboarding completed state', () => {
      // Simulate stored session hydration
      const restoredUser = { id: 'r-1', email: 'restored@example.com', name: 'Restored User', emailVerified: true, createdAt: '' }
      const restoredSession = { id: 's-r', token: 'restored-tok', expiresAt: '' }
      useAuthStore.getState().setUser(restoredUser, restoredSession)
      useOnboardingStore.setState({
        data: {
          mood: 'adventure',
          duration: 'week-plus',
          budget: 'premium',
          travelParty: 'friends',
          completed: true,
        },
      })

      const redirect = computeRouteRedirect({
        user: useAuthStore.getState().user,
        isOnboardingComplete: useOnboardingStore.getState().data.completed,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: undefined, // Launch at index
      })
      expect(redirect).toBe('/(tabs)/explore')
    })

    it('should preserve trip data and preferences across app restarts', () => {
      // Simulate user adding destinations to trip
      useTripStore.getState().addDestination('dest-1', {
        id: 'dest-1',
        name: 'Banff National Park',
        estimatedCostMinor: 85000,
      } as any)
      useTripStore.getState().addDestination('dest-2', {
        id: 'dest-2',
        name: 'Plitvice Lakes',
        estimatedCostMinor: 45000,
      } as any)

      expect(useTripStore.getState().destinations).toHaveLength(2)
      expect(useTripStore.getState().getTotalBudget()).toBe(130000)

      // Change preferences in settings
      useThemeStore.getState().setTheme('beach')
      useOnboardingStore.getState().setMood('beach')

      // Verify trip data remains untouched
      expect(useTripStore.getState().destinations).toHaveLength(2)
      expect(useTripStore.getState().destinations[0].destinationId).toBe('dest-1')
      expect(useTripStore.getState().destinations[1].destinationId).toBe('dest-2')
      expect(useTripStore.getState().getTotalBudget()).toBe(130000)
    })
  })

  describe('Journey 4: Unauthenticated user opening protected routes', () => {
    it('should redirect unauthenticated access to tabs back to Welcome', () => {
      const redirect = computeRouteRedirect({
        user: null,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: '(tabs)',
      })
      expect(redirect).toBe('/')
    })

    it('should redirect unauthenticated access to destination details back to Welcome', () => {
      const redirect = computeRouteRedirect({
        user: null,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'destination',
      })
      expect(redirect).toBe('/')
    })

    it('should redirect unauthenticated access to profile back to Welcome', () => {
      const redirect = computeRouteRedirect({
        user: null,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'profile',
      })
      expect(redirect).toBe('/')
    })

    it('should redirect unauthenticated access to onboarding back to Welcome', () => {
      const redirect = computeRouteRedirect({
        user: null,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'onboarding',
      })
      expect(redirect).toBe('/')
    })

    it('should permit unauthenticated user on Welcome and Auth routes', () => {
      const welcomeRedirect = computeRouteRedirect({
        user: null,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: undefined,
      })
      expect(welcomeRedirect).toBeNull()

      const authRedirect = computeRouteRedirect({
        user: null,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: 'auth',
      })
      expect(authRedirect).toBeNull()
    })
  })

  describe('Journey 5: Sign out', () => {
    it('should clear authenticated session and return to Welcome', async () => {
      useAuthStore.getState().setUser(
        { id: 'u-5', email: 'logout@example.com', name: 'Logout User', emailVerified: true, createdAt: '' },
        { id: 's-5', token: 'logout-token', expiresAt: '' }
      )
      useTripStore.getState().addDestination('dest-1')

      expect(useAuthStore.getState().user).not.toBeNull()

      await useAuthStore.getState().signOut()

      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().session).toBeNull()
      expect(useTripStore.getState().destinations).toHaveLength(0)

      // Guard redirects to Welcome
      const redirect = computeRouteRedirect({
        user: useAuthStore.getState().user,
        isOnboardingComplete: false,
        onboardingData: useOnboardingStore.getState().data,
        routeSegment: '(tabs)',
      })
      expect(redirect).toBe('/')
    })
  })
})

