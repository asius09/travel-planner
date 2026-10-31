import { describe, it, expect } from 'vitest'
import React from 'react'
import { Button, getButtonClasses, getButtonTextClasses, getSpinnerColor } from './components/ui/Button'
import { Text } from 'react-native'

describe('Button Component', () => {
  it('should generate correct container classes for primary, secondary, outline, and ghost variants', () => {
    const primary = getButtonClasses({ variant: 'primary', size: 'md' })
    expect(primary).toContain('bg-primary')
    expect(primary).toContain('h-11')

    const secondary = getButtonClasses({ variant: 'secondary', size: 'lg' })
    expect(secondary).toContain('bg-secondary')
    expect(secondary).toContain('h-[52px]')

    const outline = getButtonClasses({ variant: 'outline', size: 'sm' })
    expect(outline).toContain('border-primary')
    expect(outline).toContain('h-9')

    const ghost = getButtonClasses({ variant: 'ghost', size: 'md' })
    expect(ghost).toContain('bg-transparent')
  })

  it('should generate correct typography classes matching design specs', () => {
    const smText = getButtonTextClasses({ variant: 'primary', size: 'sm' })
    expect(smText).toContain('text-[13.5px]')
    expect(smText).toContain('text-primary-foreground')

    const mdText = getButtonTextClasses({ variant: 'secondary', size: 'md' })
    expect(mdText).toContain('text-[15px]')
    expect(mdText).toContain('text-secondary-foreground')

    const lgText = getButtonTextClasses({ variant: 'outline', size: 'lg' })
    expect(lgText).toContain('text-[16px]')
    expect(lgText).toContain('text-primary')
  })

  it('should resolve correct semantic spinner colors for each variant', () => {
    expect(getSpinnerColor('primary')).toBe('#FFFFFF')
    expect(getSpinnerColor('secondary')).toBe('#252B2D')
    expect(getSpinnerColor('outline')).toBe('#252B2D')
    expect(getSpinnerColor('ghost')).toBe('#252B2D')
    expect(getSpinnerColor('primary', '#E11D48')).toBe('#E11D48')
  })

  it('should support fullWidth and disabled / loading opacity styles', () => {
    const full = getButtonClasses({ fullWidth: true })
    expect(full).toContain('w-full')

    const disabled = getButtonClasses({ disabled: true })
    expect(disabled).toContain('opacity-65')

    const loading = getButtonClasses({ loading: true })
    expect(loading).toContain('opacity-65')
  })

  it('should instantiate cleanly with React.createElement including icons and loading state', () => {
    const leftIcon = React.createElement(Text, { testID: 'left-icon' }, '★')
    const rightIcon = React.createElement(Text, { testID: 'right-icon' }, '→')

    const element = React.createElement(Button, {
      variant: 'primary',
      size: 'lg',
      loading: true,
      loadingText: 'Creating account...',
      leftIcon,
      rightIcon,
      children: 'Create account',
    })

    expect(element).toBeDefined()
    expect(element.props.loading).toBe(true)
    expect(element.props.loadingText).toBe('Creating account...')
    expect(element.props.leftIcon).toBe(leftIcon)
    expect(element.props.rightIcon).toBe(rightIcon)
    expect(element.props.children).toBe('Create account')
  })
})