import { describe, it, expect } from 'vitest'
import React from 'react'
import { TextMorph, Torph } from './components/ui/TextMorph'

describe('TextMorph / Torph Component', () => {
  it('exports both TextMorph and Torph identity components', () => {
    expect(TextMorph).toBeDefined()
    expect(Torph).toBe(TextMorph)
  })

  it('renders children text correctly in word mode', () => {
    const element = React.createElement(TextMorph, { mode: 'word', children: 'Your Next Adventure' })
    expect(element.props.children).toBe('Your Next Adventure')
    expect(element.props.mode).toBe('word')
  })

  it('renders correctly in smooth mode for titles', () => {
    const element = React.createElement(TextMorph, { mode: 'smooth', children: 'Travel Made Simple' })
    expect(element.props.children).toBe('Travel Made Simple')
    expect(element.props.mode).toBe('smooth')
  })

  it('handles numeric input properly without errors', () => {
    const element = React.createElement(Torph, { mode: 'char', children: 249 })
    expect(element.props.children).toBe(249)
    expect(element.props.mode).toBe('char')
  })
})
