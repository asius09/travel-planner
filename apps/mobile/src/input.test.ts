import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Input, getBaseInputClasses } from './components/ui/Input'

describe('Input Component', () => {
  it('should generate correct base input classes for standard states', () => {
    const defaultClasses = getBaseInputClasses({})
    expect(defaultClasses).toContain('min-h-[50px]')
    expect(defaultClasses).toContain('border')
    expect(defaultClasses).toContain('rounded-[14px]')
    expect(defaultClasses).toContain('bg-surface')
    expect(defaultClasses).toContain('border-border')
  })

  it('should handle focus state with primary border without widening border or outline', () => {
    const focusedClasses = getBaseInputClasses({ isFocused: true })
    expect(focusedClasses).toContain('border-primary')
    expect(focusedClasses).toContain('border')
    expect(focusedClasses).not.toContain('border-2')
    expect(focusedClasses).not.toContain('border-[1.5px]')
  })

  it('should handle error state with alert border and background tint', () => {
    const errorClasses = getBaseInputClasses({ hasError: true })
    expect(errorClasses).toContain('border-red-500')
    expect(errorClasses).toContain('bg-red-50/50')
    expect(errorClasses).toContain('border')
  })

  it('should support rounded and transparent variants', () => {
    const pillClasses = getBaseInputClasses({ rounded: true, transparent: true })
    expect(pillClasses).toContain('rounded-full')
    expect(pillClasses).toContain('bg-transparent')
  })

  it('should support disabled state opacity', () => {
    const disabledClasses = getBaseInputClasses({ disabled: true })
    expect(disabledClasses).toContain('opacity-60')
  })

  it('should instantiate cleanly with React.createElement', () => {
    const element = React.createElement(Input, {
      label: 'Email',
      placeholder: 'user@example.com',
      error: 'Invalid email',
      helperText: 'We will never share your email',
    })
    expect(element).toBeDefined()
    expect(element.props.label).toBe('Email')
    expect(element.props.error).toBe('Invalid email')
    expect(element.props.helperText).toBe('We will never share your email')
  })
})
