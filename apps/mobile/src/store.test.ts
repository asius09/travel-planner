import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboardingStore, getResumeStep } from '@/store/onboardingStore'
import { useTripStore } from '@/store/tripStore'
import { useAuthStore } from '@/store/authStore'
import { semanticColors, primitiveColors } from '@/theme/colors'

describe('NativeWind Design Tokens', () => {
  it('resolves semantic tokens from single source of truth primitives', () => {
    expect(semanticColors.primary).toBe(primitiveColors.ocean700)
    expect(semanticColors.background).toBe(primitiveColors.ivory50)
    expect(semanticColors.foreground).toBe(primitiveColors.ink900)
    expect(semanticColors.secondary).toBe(primitiveColors.mist100)
    expect(semanticColors.card).toBe(primitiveColors.white)
  })
})

describe('Onboarding Store', () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetOnboarding()
  })

  it('should have empty initial state', () => {
    const store = useOnboardingStore.getState()
    expect(store.data.mood).toBeUndefined()
    expect(store.data.duration).toBeUndefined()
    expect(store.data.budget).toBeUndefined()
    expect(store.data.travelParty).toBeUndefined()
    expect(store.data.completed).toBe(false)
  })

  it('should update mood', () => {
    const store = useOnboardingStore.getState()
    store.setMood('beach')
    const updated = useOnboardingStore.getState()
    expect(updated.data.mood).toBe('beach')
  })

  it('should update duration', () => {
    const store = useOnboardingStore.getState()
    store.setDuration('3-5-days')
    const updated = useOnboardingStore.getState()
    expect(updated.data.duration).toBe('3-5-days')
  })

  it('should update budget', () => {
    const store = useOnboardingStore.getState()
    store.setBudget('premium')
    const updated = useOnboardingStore.getState()
    expect(updated.data.budget).toBe('premium')
  })

  it('should update travel party', () => {
    const store = useOnboardingStore.getState()
    store.setTravelParty('couple')
    const updated = useOnboardingStore.getState()
    expect(updated.data.travelParty).toBe('couple')
  })

  it('should complete onboarding after every answer is saved', async () => {
    const store = useOnboardingStore.getState()
    store.setMood('nature')
    store.setDuration('weekend')
    store.setBudget('balanced')
    store.setTravelParty('couple')
    await store.completeOnboarding()
    const updated = useOnboardingStore.getState()
    expect(updated.data.completed).toBe(true)
    expect(updated.isComplete()).toBe(true)
  })

  it('should refuse to complete onboarding while answers are missing', async () => {
    const store = useOnboardingStore.getState()
    store.setMood('nature')
    store.setDuration('weekend')
    await expect(store.completeOnboarding()).rejects.toThrow('Onboarding is incomplete')
    expect(useOnboardingStore.getState().data.completed).toBe(false)
  })

  it('should preserve answers after completion', async () => {
    const store = useOnboardingStore.getState()
    store.setMood('nature')
    store.setDuration('weekend')
    store.setBudget('balanced')
    store.setTravelParty('couple')
    await store.completeOnboarding()
    const updated = useOnboardingStore.getState()
    expect(updated.data.mood).toBe('nature')
    expect(updated.data.duration).toBe('weekend')
    expect(updated.data.completed).toBe(true)
  })

  it('should correctly calculate resume step', () => {
    expect(getResumeStep({ completed: false })).toBe('/onboarding/mood')
    expect(getResumeStep({ mood: 'nature', completed: false })).toBe('/onboarding/duration')
    expect(getResumeStep({ mood: 'nature', duration: 'weekend', completed: false })).toBe(
      '/onboarding/budget'
    )
    expect(
      getResumeStep({
        mood: 'nature',
        duration: 'weekend',
        budget: 'balanced',
        completed: false,
      })
    ).toBe('/onboarding/travel-party')
    expect(
      getResumeStep({
        mood: 'nature',
        duration: 'weekend',
        budget: 'balanced',
        travelParty: 'solo',
        completed: false,
      })
    ).toBe('/onboarding/location')
  })
})

describe('Trip Store', () => {
  beforeEach(() => {
    useTripStore.getState().clearTrip()
  })

  it('should have empty initial state', () => {
    const store = useTripStore.getState()
    expect(store.destinations).toEqual([])
    expect(store.isInTrip('00000000-0000-0000-0000-000000000000')).toBe(false)
  })

  it('should add destination to trip with cost details', () => {
    const store = useTripStore.getState()
    const wasAdded = store.addDestination('dest-1', {
      name: 'Banff',
      estimatedCostMinor: 85000,
    } as any)
    const updated = useTripStore.getState()
    expect(wasAdded).toBe(true)
    expect(updated.destinations).toHaveLength(1)
    expect(updated.destinations[0].destinationId).toBe('dest-1')
    expect(updated.destinations[0].position).toBe(0)
    expect(updated.destinations[0].destination?.name).toBe('Banff')
    expect(updated.isInTrip('dest-1')).toBe(true)
    expect(updated.getTotalBudget()).toBe(85000)
  })

  it('should prevent duplicate destination', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    const wasAdded = store.addDestination('dest-1')
    const updated = useTripStore.getState()
    expect(wasAdded).toBe(false)
    expect(updated.destinations).toHaveLength(1)
  })

  it('should remove destination from trip and update budget', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1', { estimatedCostMinor: 50000 } as any)
    store.addDestination('dest-2', { estimatedCostMinor: 40000 } as any)
    expect(useTripStore.getState().getTotalBudget()).toBe(90000)

    store.removeDestination('dest-1')
    const updated = useTripStore.getState()
    expect(updated.destinations).toHaveLength(1)
    expect(updated.isInTrip('dest-1')).toBe(false)
    expect(updated.isInTrip('dest-2')).toBe(true)
    expect(updated.getTotalBudget()).toBe(40000)
  })

  it('should reorder destinations', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    store.addDestination('dest-2')
    store.addDestination('dest-3')
    store.reorderDestinations(0, 2)
    const updated = useTripStore.getState()
    expect(updated.destinations[0].destinationId).toBe('dest-2')
    expect(updated.destinations[1].destinationId).toBe('dest-3')
    expect(updated.destinations[2].destinationId).toBe('dest-1')
  })

  it('should clear trip', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    store.addDestination('dest-2')
    store.clearTrip()
    const updated = useTripStore.getState()
    expect(updated.destinations).toEqual([])
    expect(updated.getTotalBudget()).toBe(0)
  })
})

describe('Auth Store', () => {
  beforeEach(async () => {
    await useAuthStore.getState().signOut()
  })

  it('should initialize with null user and session', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
  })

  it('should update user and session with setUser', () => {
    const mockUser = {
      id: 'u-1',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    }
    const mockSession = {
      id: 's-1',
      token: 'token-123',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    }

    useAuthStore.getState().setUser(mockUser, mockSession)
    const state = useAuthStore.getState()
    expect(state.user?.email).toBe('test@example.com')
    expect(state.user?.name).toBe('Test User')
    expect(state.session?.token).toBe('token-123')
  })

  it('should clear user and session on signOut', async () => {
    useAuthStore.getState().setUser(
      {
        id: 'u-1',
        email: 'test@example.com',
        name: 'Test',
        emailVerified: true,
        createdAt: '',
      },
      { id: 's-1', token: 'tok', expiresAt: '' }
    )

    await useAuthStore.getState().signOut()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
  })
})
