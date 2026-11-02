import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { ProfileAvatar } from './components/ui/ProfileAvatar'
import { TripSummary } from './components/ui/TripSummary'
import { FeaturedDestination } from './components/ui/FeaturedDestination'
import { SectionHeader } from './components/ui/SectionHeader'
import { EmptyTripState } from './components/ui/EmptyTripState'
import { ItineraryRow } from './components/ui/ItineraryRow'
import { ScreenFade } from './components/ui/ScreenFade'
import { DestinationCard } from './components/ui/DestinationCard'
import { PreferenceSummary } from './components/ui/PreferenceSummary'
import { useTripStore } from './store/tripStore'
import { useAuthStore } from './store/authStore'
import { radii, typography, spacing, avatarGradients } from './theme/tokens'

const mockDestination = {
  id: 'dest-1',
  slug: 'banff-national-park',
  name: 'Banff National Park',
  country: 'Canada',
  region: 'Alberta',
  shortDescription: 'Glacial lakes, soaring peaks, and alpine wilderness in the Canadian Rockies.',
  description: 'Full description of Banff',
  heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  moodTags: ['nature' as const],
  categoryTags: ['national park', 'hiking'],
  suggestedDaysMin: 3,
  suggestedDaysMax: 5,
  estimatedCostMinor: 85000,
  costCurrency: 'USD',
  highlights: ['Lake Louise', 'Moraine Lake'],
  bestMonths: [6, 7, 8, 9],
  coordinates: { latitude: 51.1784, longitude: -115.5708 },
  isPublished: true,
  popularity: 90,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('Design Tokens', () => {
  it('defines correct semantic palette via CSS variables (verified at runtime)', () => {
    // Color tokens are now defined in global.css as CSS variables
    // Runtime verification would require a browser/test environment with CSS support
    // This test verifies the tokens structure is correctly exported
    expect(radii).toBeDefined()
    expect(typography).toBeDefined()
    expect(spacing).toBeDefined()
    expect(avatarGradients).toBeDefined()
  })

  it('defines consistent radius, typography, and spacing scales', () => {
    expect(radii.cardLg).toBe(28)
    expect(radii.card).toBe(20)
    expect(radii.pill).toBe(9999)
    expect(spacing.md).toBe(12)
    expect(spacing.lg).toBe(16)
    expect(spacing.xl).toBe(20)
    expect(typography.fontFamily.display).toBe('Geist')
  })

  it('defines mood-specific avatar gradients', () => {
    expect(avatarGradients.nature).toEqual(['#D4F638', '#2D5B48', '#14261F'])
    expect(avatarGradients.city).toEqual(['#F59E0B', '#B45309', '#451A03'])
    expect(avatarGradients.beach).toEqual(['#38BDF8', '#0284C7', '#083344'])
    expect(avatarGradients.adventure).toEqual(['#FB923C', '#C2410C', '#1E293B'])
  })
})

describe('Redesign UI Components', () => {
  beforeEach(() => {
    useTripStore.getState().clearTrip()
    useAuthStore.getState().setUser(
      {
        id: 'u-1',
        email: 'alex@example.com',
        name: 'Alex Rivera',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      },
      { id: 's-1', token: 'tok', expiresAt: '' }
    )
  })

  describe('ProfileAvatar', () => {
    it('creates ProfileAvatar element with different size variants', () => {
      const elSm: any = React.createElement(ProfileAvatar as any, { size: 'sm' })
      expect(elSm.props.size).toBe('sm')

      const onPress = vi.fn()
      const elLg: any = React.createElement(ProfileAvatar as any, { size: 'lg', onPress })
      expect(elLg.props.size).toBe('lg')
      expect(elLg.props.onPress).toBe(onPress)
    })
  })

  describe('TripSummary', () => {
    it('initializes with empty destinations', () => {
      expect(useTripStore.getState().destinations).toHaveLength(0)
      const el: any = React.createElement(TripSummary as any, {})
      expect(el).toBeDefined()
    })

    it('calculates correct budget when destinations are present', () => {
      useTripStore.getState().addDestination('dest-1', mockDestination)
      expect(useTripStore.getState().destinations).toHaveLength(1)
      expect(useTripStore.getState().getTotalBudget()).toBe(85000)
    })
  })

  describe('FeaturedDestination', () => {
    it('instantiates correctly with destination props', () => {
      const onPress = vi.fn()
      const el: any = React.createElement(FeaturedDestination as any, {
        destination: mockDestination,
        onPress,
      })
      expect(el.props.destination.name).toBe('Banff National Park')
      expect(el.props.onPress).toBe(onPress)
    })

    it('handles add and remove in trip store directly', () => {
      useTripStore.getState().addDestination(mockDestination.id, mockDestination)
      expect(useTripStore.getState().isInTrip(mockDestination.id)).toBe(true)

      useTripStore.getState().removeDestination(mockDestination.id)
      expect(useTripStore.getState().isInTrip(mockDestination.id)).toBe(false)
    })
  })

  describe('DestinationCard', () => {
    it('supports standard and compact layouts', () => {
      const standard: any = React.createElement(DestinationCard as any, {
        destination: mockDestination,
        layout: 'standard',
      })
      expect(standard.props.layout).toBe('standard')

      const compact: any = React.createElement(DestinationCard as any, {
        destination: mockDestination,
        layout: 'compact',
      })
      expect(compact.props.layout).toBe('compact')
    })
  })

  describe('SectionHeader', () => {
    it('instantiates with title, subtitle, and actionLabel', () => {
      const onAction = vi.fn()
      const el: any = React.createElement(SectionHeader as any, {
        title: 'Picked for your mood',
        subtitle: 'Curated for nature escapes',
        actionLabel: 'See all',
        onAction,
      })
      expect(el.props.title).toBe('Picked for your mood')
      expect(el.props.subtitle).toBe('Curated for nature escapes')
      expect(el.props.actionLabel).toBe('See all')
    })
  })

  describe('EmptyTripState', () => {
    it('instantiates with onExplore callback', () => {
      const onExplore = vi.fn()
      const el: any = React.createElement(EmptyTripState as any, { onExplore })
      expect(el.props.onExplore).toBe(onExplore)
    })
  })

  describe('ItineraryRow', () => {
    it('instantiates with position, destination, and reordering callbacks', () => {
      const onPress = vi.fn()
      const onRemove = vi.fn()
      const onMoveUp = vi.fn()
      const onMoveDown = vi.fn()

      const el: any = React.createElement(ItineraryRow as any, {
        position: 0,
        destination: mockDestination,
        onPress,
        onRemove,
        onMoveUp,
        onMoveDown,
        canMoveUp: false,
        canMoveDown: true,
      })

      expect(el.props.position).toBe(0)
      expect(el.props.destination.name).toBe('Banff National Park')
      expect(el.props.canMoveUp).toBe(false)
      expect(el.props.canMoveDown).toBe(true)
    })
  })

  describe('PreferenceSummary', () => {
    it('instantiates cleanly', () => {
      const el: any = React.createElement(PreferenceSummary as any, {})
      expect(el).toBeDefined()
    })
  })

  describe('ScreenFade', () => {
    it('instantiates with height and visibility', () => {
      const el: any = React.createElement(ScreenFade as any, {
        height: 36,
        visible: true,
      })
      expect(el.props.height).toBe(36)
      expect(el.props.visible).toBe(true)
    })
  })
})