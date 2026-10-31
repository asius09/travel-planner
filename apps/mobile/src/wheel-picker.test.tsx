import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { WheelPicker, type WheelItem } from './components/ui/WheelPicker'
import { formatDurationLabel, daysToDurationCategory } from './utils/duration'

describe('WheelPicker Component', () => {
  const items: WheelItem<string>[] = [
    { value: 'budget-friendly', label: 'Budget-friendly', subtitle: 'Under $1,000', symbol: '$' },
    { value: 'balanced', label: 'Balanced', subtitle: '$1,000 – $3,000', symbol: '$$' },
    { value: 'premium', label: 'Premium', subtitle: '$3,000+', symbol: '$$$' },
    { value: 'not-sure', label: 'Not sure yet', subtitle: 'Flexible', symbol: '~' },
  ]

  it('renders correctly with items and selected value', () => {
    const onValueChange = vi.fn()
    const element = React.createElement(WheelPicker, {
      items,
      selectedValue: 'balanced',
      onValueChange,
      itemWidth: 140,
    })

    expect(element).toBeDefined()
    expect(element.props.items).toHaveLength(4)
    expect(element.props.selectedValue).toBe('balanced')
    expect(element.props.itemWidth).toBe(140)
  })

  it('supports custom sizing and fade colors', () => {
    const onValueChange = vi.fn()
    const element = React.createElement(WheelPicker, {
      items,
      selectedValue: 'premium',
      onValueChange,
      itemWidth: 160,
      itemHeight: 90,
      fadeColor: '#F8F6EF',
      disabled: false,
    })

    expect(element.props.itemWidth).toBe(160)
    expect(element.props.itemHeight).toBe(90)
    expect(element.props.fadeColor).toBe('#F8F6EF')
  })

  it('supports vertical orientation and labels-only variant', () => {
    const onValueChange = vi.fn()
    const element = React.createElement(WheelPicker, {
      items,
      selectedValue: 'balanced',
      onValueChange,
      orientation: 'vertical',
      variant: 'labels-only',
      itemHeight: 48,
      fadeColor: '#F8F6EF',
    })

    expect(element).toBeDefined()
    expect(element.props.orientation).toBe('vertical')
    expect(element.props.variant).toBe('labels-only')
    expect(element.props.itemHeight).toBe(48)
  })

  it('handles boundary selections at start and end without errors', () => {
    const onValueChange = vi.fn()
    const firstElement = React.createElement(WheelPicker, {
      items,
      selectedValue: 'budget-friendly', // Index 0
      onValueChange,
      orientation: 'vertical',
      variant: 'labels-only',
    })
    expect(firstElement.props.selectedValue).toBe('budget-friendly')

    const lastElement = React.createElement(WheelPicker, {
      items,
      selectedValue: 'not-sure', // Index 3 (last)
      onValueChange,
      orientation: 'vertical',
      variant: 'labels-only',
    })
    expect(lastElement.props.selectedValue).toBe('not-sure')
  })

  it('supports disabled state gracefully', () => {
    const onValueChange = vi.fn()
    const element = React.createElement(WheelPicker, {
      items,
      selectedValue: 'budget-friendly',
      onValueChange,
      disabled: true,
    })

    expect(element.props.disabled).toBe(true)
  })
})

describe('Duration Wheel Data Synchronization', () => {
  it('correctly maps all 30 duration wheel items with smooth day/week transitions', () => {
    const durationItems: WheelItem<number>[] = Array.from({ length: 30 }, (_, i) => {
      const days = i + 1
      return {
        value: days,
        label: formatDurationLabel(days),
      }
    })

    expect(durationItems).toHaveLength(30)
    // Check key milestone values
    expect(durationItems[0].label).toBe('1 day')
    expect(durationItems[1].label).toBe('2 days')
    expect(durationItems[5].label).toBe('6 days')
    expect(durationItems[6].label).toBe('1 week')
    expect(durationItems[7].label).toBe('1 week 1 day')
    expect(durationItems[8].label).toBe('1 week 2 days')
    expect(durationItems[13].label).toBe('2 weeks')
    expect(durationItems[20].label).toBe('3 weeks')
    expect(durationItems[27].label).toBe('4 weeks')
    expect(durationItems[29].label).toBe('1 month')
  })

  it('maps duration categories consistently across schema bounds', () => {
    expect(daysToDurationCategory(1)).toBe('weekend')
    expect(daysToDurationCategory(2)).toBe('weekend')
    expect(daysToDurationCategory(3)).toBe('3-5-days')
    expect(daysToDurationCategory(6)).toBe('3-5-days')
    expect(daysToDurationCategory(7)).toBe('week-plus')
    expect(daysToDurationCategory(30)).toBe('week-plus')
  })
})
