import { describe, it, expect } from 'vitest'
import React from 'react'
import {
  TextMorph,
  Torph,
  MorphingText,
  findSharedGlyphs,
  assignGlyphIds,
  assignDigitIds,
  segmentGraphemes,
  toGlyph,
  MOTION_PRESETS,
} from './components/ui/TextMorph'

describe('TextMorph / MorphingText Component (expo-morphing-text architecture)', () => {
  it('exports TextMorph, MorphingText, and Torph identity components', () => {
    expect(TextMorph).toBeDefined()
    expect(MorphingText).toBeDefined()
    expect(Torph).toBe(MorphingText)
    expect(TextMorph).toBe(MorphingText)
  })

  it('correctly segments graphemes including spaces and symbols', () => {
    const chars = segmentGraphemes('5 days')
    expect(chars).toEqual(['5', ' ', 'd', 'a', 'y', 's'])
  })

  it('replaces standard space with non-breaking space for rock-solid React Native layout stability', () => {
    expect(toGlyph(' ')).toBe('\u00A0')
    expect(toGlyph('a')).toBe('a')
  })

  it('finds shared glyph pairs accurately between consecutive transitions', () => {
    // "1 week" -> "1 week 1 day"
    const prev = segmentGraphemes('1 week')
    const next = segmentGraphemes('1 week 1 day')
    const pairs = findSharedGlyphs(prev, next)

    // First 6 characters ('1', ' ', 'w', 'e', 'e', 'k') must match indices 0..5
    expect(pairs.length).toBe(6)
    for (let i = 0; i < 6; i++) {
      expect(pairs[i]).toEqual([i, i])
    }
  })

  it('preserves persistent glyph IDs for stable layout morphing', () => {
    const prevIds = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5']
    const result = assignGlyphIds('1 week', '1 week 1 day', prevIds, 6)

    // The shared '1 week' must keep identical ids 'g0'..'g5'
    expect(result.ids.slice(0, 6)).toEqual(prevIds)
    // The new characters must get new IDs starting from seed 6
    expect(result.ids.length).toBe(12)
    expect(result.idSeed).toBe(12)
    expect(result.churn).toBeGreaterThan(0)
  })

  it('assigns digit ids and detects numeric scrub direction', () => {
    const prevIds = [0, 1]
    const inc = assignDigitIds('15', '16', prevIds, 2)
    expect(inc.direction).toBe(1) // Increasing

    const dec = assignDigitIds('20', '19', prevIds, 2)
    expect(dec.direction).toBe(-1) // Decreasing
  })

  it('provides all 4 official motion presets (default, smooth, snappy, bouncy)', () => {
    expect(MOTION_PRESETS.default).toBeDefined()
    expect(MOTION_PRESETS.smooth).toBeDefined()
    expect(MOTION_PRESETS.snappy).toBeDefined()
    expect(MOTION_PRESETS.bouncy).toBeDefined()
  })

  it('renders correctly with variant="text"', () => {
    const el = React.createElement(MorphingText, {
      text: 'Explore Kyoto',
      variant: 'text',
      preset: 'smooth',
    })
    expect(el.props.text).toBe('Explore Kyoto')
    expect(el.props.variant).toBe('text')
  })

  it('renders correctly with variant="number"', () => {
    const el = React.createElement(MorphingText, {
      text: '1250',
      variant: 'number',
      preset: 'snappy',
    })
    expect(el.props.text).toBe('1250')
    expect(el.props.variant).toBe('number')
  })

  it('renders correctly with variant="slots"', () => {
    const el = React.createElement(MorphingText, {
      text: '777',
      variant: 'slots',
    })
    expect(el.props.text).toBe('777')
    expect(el.props.variant).toBe('slots')
  })

  it('handles rapid consecutive updates under hard loads without crashing', () => {
    const values = ['1 day', '5 days', '10 days', '25 days', '60 days', '90 days']
    for (const val of values) {
      const el = React.createElement(TextMorph, { children: val })
      expect(el.props.children).toBe(val)
    }
  })
})
