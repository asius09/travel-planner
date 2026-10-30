import { describe, it, expect } from 'vitest'
import { useThemeStore, type TravelMood } from '@/store/themeStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useTripStore } from '@/store/tripStore'

describe('Theme Store', () => {
  it('should have default nature theme', () => {
    const store = useThemeStore.getState()
    expect(store.theme).toBe('nature')
    expect(store.tokens.primary).toBe('#263F35')
    expect(store.tokens.accent).toBe('#D7E58A')
    expect(store.tokens.soft).toBe('#E8EBDD')
  })

  it('should change theme and update tokens', () => {
    const store = useThemeStore.getState()
    store.setTheme('beach')
    const updated = useThemeStore.getState()
    expect(updated.theme).toBe('beach')
    expect(updated.tokens.primary).toBe('#176C70')
    expect(updated.tokens.accent).toBe('#E3C77A')
    expect(updated.tokens.soft).toBe('#DCEEF0')
  })

  it('should handle all four mood themes', () => {
    const store = useThemeStore.getState()
    const themes: TravelMood[] = ['nature', 'city', 'beach', 'adventure']
    themes.forEach((theme) => {
      store.setTheme(theme)
      const updated = useThemeStore.getState()
      expect(updated.theme).toBe(theme)
      expect(updated.tokens.primary).toBeDefined()
      expect(updated.tokens.accent).toBeDefined()
      expect(updated.tokens.soft).toBeDefined()
    })
  })
})

describe('Onboarding Store', () => {
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

  it('should complete onboarding', () => {
    const store = useOnboardingStore.getState()
    store.completeOnboarding()
    const updated = useOnboardingStore.getState()
    expect(updated.data.completed).toBe(true)
  })

  it('should preserve answers after completion', () => {
    const store = useOnboardingStore.getState()
    store.setMood('nature')
    store.setDuration('weekend')
    store.completeOnboarding()
    const updated = useOnboardingStore.getState()
    expect(updated.data.mood).toBe('nature')
    expect(updated.data.duration).toBe('weekend')
    expect(updated.data.completed).toBe(true)
  })
})

describe('Trip Store', () => {
  it('should have empty initial state', () => {
    const store = useTripStore.getState()
    expect(store.destinations).toEqual([])
    expect(store.isInTrip('00000000-0000-0000-0000-000000000000')).toBe(false)
  })

  it('should add destination to trip', () => {
    const store = useTripStore.getState()
    const wasAdded = store.addDestination('dest-1')
    const updated = useTripStore.getState()
    expect(wasAdded).toBe(true)
    expect(updated.destinations).toHaveLength(1)
    expect(updated.destinations[0].destinationId).toBe('dest-1')
    expect(updated.destinations[0].position).toBe(0)
    expect(updated.isInTrip('dest-1')).toBe(true)
  })

  it('should prevent duplicate destination', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    const wasAdded = store.addDestination('dest-1')
    const updated = useTripStore.getState()
    expect(wasAdded).toBe(false)
    expect(updated.destinations).toHaveLength(1)
  })

  it('should remove destination from trip', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    store.removeDestination('dest-1')
    const updated = useTripStore.getState()
    expect(updated.destinations).toHaveLength(0)
    expect(updated.isInTrip('dest-1')).toBe(false)
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

  it('should update positions after reorder', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    store.addDestination('dest-2')
    store.addDestination('dest-3')
    store.reorderDestinations(2, 0)
    const updated = useTripStore.getState()
    expect(updated.destinations[0].position).toBe(0)
    expect(updated.destinations[1].position).toBe(1)
    expect(updated.destinations[2].position).toBe(2)
  })

  it('should clear trip', () => {
    const store = useTripStore.getState()
    store.addDestination('dest-1')
    store.addDestination('dest-2')
    store.clearTrip()
    const updated = useTripStore.getState()
    expect(updated.destinations).toEqual([])
  })
})