import { describe, it, expect } from 'vitest'
import { formatCurrency, convertCurrency, getDisplayCurrency, parseCurrencyInput } from '../utils/currency'

describe('Currency Formatting', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(10000, 'USD')).toContain('$')
    expect(formatCurrency(10000, 'USD')).toContain('100')
  })
  
  it('should format INR correctly', () => {
    expect(formatCurrency(10000, 'INR')).toContain('₹')
    expect(formatCurrency(10000, 'INR')).toContain('100')
  })
  
  it('should handle zero amount', () => {
    expect(formatCurrency(0, 'USD')).toContain('$0')
    expect(formatCurrency(0, 'INR')).toContain('₹0')
  })
  
  it('should handle large amounts', () => {
    const result = formatCurrency(100000000, 'USD') // $1,000,000
    expect(result).toContain('1,000,000')
  })
  
  it('should use correct decimal places for INR', () => {
    expect(formatCurrency(12345, 'INR')).toBe('₹123')
    expect(formatCurrency(12399, 'INR')).toBe('₹124') // Rounding
  })
  
  it('should use correct decimal places for USD', () => {
    expect(formatCurrency(12345, 'USD')).toBe('$123.45')
    expect(formatCurrency(12300, 'USD')).toBe('$123.00')
  })
})

describe('Currency Conversion', () => {
  it('should convert USD to INR', () => {
    const result = convertCurrency(10000, 'USD', 'INR') // $100 to INR
    // 100 * 83.12 = 8312 INR = 831200 minor units
    expect(result).toBe(831200)
  })
  
  it('should convert INR to USD', () => {
    const result = convertCurrency(831200, 'INR', 'USD')
    expect(result).toBe(10000)
  })
  
  it('should return same amount for same currency', () => {
    expect(convertCurrency(10000, 'USD', 'USD')).toBe(10000)
    expect(convertCurrency(10000, 'INR', 'INR')).toBe(10000)
  })
})

describe('Display Currency', () => {
  it('should return INR for India region', () => {
    expect(getDisplayCurrency('IN')).toBe('INR')
  })
  
  it('should return USD for other regions', () => {
    expect(getDisplayCurrency('US')).toBe('USD')
    expect(getDisplayCurrency('GB')).toBe('USD')
    expect(getDisplayCurrency()).toBe('USD')
  })
})

describe('Parse Currency Input', () => {
  it('should parse USD input', () => {
    expect(parseCurrencyInput('$100', 'USD')).toBe(10000)
    expect(parseCurrencyInput('100.00', 'USD')).toBe(10000)
    expect(parseCurrencyInput('1,000', 'USD')).toBe(100000)
  })
  
  it('should parse INR input', () => {
    expect(parseCurrencyInput('₹100', 'INR')).toBe(10000)
    expect(parseCurrencyInput('100', 'INR')).toBe(10000)
  })
  
  it('should return null for invalid input', () => {
    expect(parseCurrencyInput('abc', 'USD')).toBeNull()
    expect(parseCurrencyInput('', 'USD')).toBeNull()
  })
})