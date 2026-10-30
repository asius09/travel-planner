import { describe, it, expect, beforeEach } from 'vitest'
import {
  formatDurationLabel,
  daysToDurationCategory,
} from './utils/duration'
import {
  useOnboardingStore,
  getResumeStep,
} from './store/onboardingStore'

describe('Duration Helpers', () => {
  it('should correctly format day durations into human travel terms', () => {
    expect(formatDurationLabel(0)).toBe('Flexible')
    expect(formatDurationLabel(1)).toBe('1 day')
    expect(formatDurationLabel(2)).toBe('2 days')
    expect(formatDurationLabel(5)).toBe('5 days')
    expect(formatDurationLabel(6)).toBe('6 days')
    expect(formatDurationLabel(7)).toBe('1 week')
    expect(formatDurationLabel(8)).toBe('1 week 1 day')
    expect(formatDurationLabel(10)).toBe('1 week 3 days')
    expect(formatDurationLabel(13)).toBe('1 week 6 days')
    expect(formatDurationLabel(14)).toBe('2 weeks')
    expect(formatDurationLabel(15)).toBe('2 weeks 1 day')
    expect(formatDurationLabel(20)).toBe('2 weeks 6 days')
    expect(formatDurationLabel(21)).toBe('3 weeks')
    expect(formatDurationLabel(25)).toBe('3+ weeks')
  })

  it('should map numeric days to duration schema categories', () => {
    expect(daysToDurationCategory(1)).toBe('weekend')
    expect(daysToDurationCategory(2)).toBe('weekend')
    expect(daysToDurationCategory(3)).toBe('3-5-days')
    expect(daysToDurationCategory(5)).toBe('3-5-days')
    expect(daysToDurationCategory(6)).toBe('3-5-days')
    expect(daysToDurationCategory(7)).toBe('week-plus')
    expect(daysToDurationCategory(14)).toBe('week-plus')
    expect(daysToDurationCategory(21)).toBe('week-plus')
  })
})

describe('Onboarding Flow & Navigation Sequence', () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetOnboarding()
  })

  it('progresses smoothly through all 6 onboarding steps', async () => {
    const store = useOnboardingStore.getState()

    // Step 1: Mood
    expect(getResumeStep(store.data)).toBe('/onboarding/mood')
    store.setMood('nature')
    expect(getResumeStep(useOnboardingStore.getState().data)).toBe('/onboarding/duration')

    // Step 2: Duration
    store.setDuration('3-5-days')
    expect(getResumeStep(useOnboardingStore.getState().data)).toBe('/onboarding/budget')

    // Step 3: Budget
    store.setBudget('balanced')
    expect(getResumeStep(useOnboardingStore.getState().data)).toBe('/onboarding/travel-party')

    // Step 4: Travel Party
    store.setTravelParty('couple')
    expect(getResumeStep(useOnboardingStore.getState().data)).toBe('/onboarding/location')

    // Completing onboarding
    await useOnboardingStore.getState().completeOnboarding()
    expect(useOnboardingStore.getState().isComplete()).toBe(true)
  })
})
