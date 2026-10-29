import type { Currency, CurrencyFormatOptions } from '../types'

// Exchange rate cache (in a real app, this would come from an API)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  INR: 83.12, // Approximate rate, should be fetched from real API
}

const RATE_TIMESTAMP = Date.now()

export function formatCurrency(
  amountMinor: number,
  currency: Currency = 'USD',
  options: Partial<CurrencyFormatOptions> = {}
): string {
  const locale = options.locale ?? (currency === 'INR' ? 'en-IN' : 'en-US')
  const majorAmount = amountMinor / 100
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options.minimumFractionDigits ?? (currency === 'INR' ? 0 : 2),
      maximumFractionDigits: options.maximumFractionDigits ?? (currency === 'INR' ? 0 : 2),
    }).format(majorAmount)
  } catch {
    // Fallback for unsupported locales/currencies
    const symbol = currency === 'INR' ? '₹' : '$'
    return `${symbol}${majorAmount.toLocaleString(locale, {
      minimumFractionDigits: options.minimumFractionDigits ?? (currency === 'INR' ? 0 : 2),
      maximumFractionDigits: options.maximumFractionDigits ?? (currency === 'INR' ? 0 : 2),
    })}`
  }
}

export function convertCurrency(
  amountMinor: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amountMinor
  
  const fromRate = EXCHANGE_RATES[fromCurrency]
  const toRate = EXCHANGE_RATES[toCurrency]
  
  // Convert minor units to major, apply exchange rate, convert back to minor
  const majorAmount = amountMinor / 100
  const convertedMajor = (majorAmount / fromRate) * toRate
  return Math.round(convertedMajor * 100)
}

export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return 1
  return EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency]
}

export function getRateTimestamp(): number {
  return RATE_TIMESTAMP
}

export function getDisplayCurrency(regionCode?: string): Currency {
  return regionCode === 'IN' ? 'INR' : 'USD'
}

export function parseCurrencyInput(input: string, currency: Currency): number | null {
  // Remove currency symbols and parse
  const cleaned = input.replace(/[^\d.,]/g, '').replace(',', '')
  const parsed = parseFloat(cleaned)
  if (isNaN(parsed)) return null
  return Math.round(parsed * 100)
}