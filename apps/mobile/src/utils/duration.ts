import type { Duration } from '@travel-planner/shared'

/**
 * Format numeric days into intuitive, structured travel duration copy (up to 3 months / 90 days).
 */
export function formatDurationLabel(days: number): string {
  if (days <= 0) return 'Flexible'
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  if (days === 7) return '1 week'
  if (days < 14) {
    const extra = days - 7
    return `1 week ${extra} ${extra === 1 ? 'day' : 'days'}`
  }
  if (days === 14) return '2 weeks'
  if (days < 21) {
    const extra = days - 14
    return `2 weeks ${extra} ${extra === 1 ? 'day' : 'days'}`
  }
  if (days === 21) return '3 weeks'
  if (days < 28) {
    const extra = days - 21
    return `3 weeks ${extra} ${extra === 1 ? 'day' : 'days'}`
  }
  if (days === 28) return '4 weeks'
  if (days < 30) return '1 month'
  if (days === 30) return '1 month'
  if (days < 60) {
    const extraDays = days - 30
    if (extraDays === 0) return '1 month'
    const extraWeeks = Math.floor(extraDays / 7)
    const remDays = extraDays % 7
    if (remDays === 0) return `1 month ${extraWeeks} ${extraWeeks === 1 ? 'week' : 'weeks'}`
    if (extraWeeks === 0) return `1 month ${remDays} ${remDays === 1 ? 'day' : 'days'}`
    return `1 month ${extraWeeks} ${extraWeeks === 1 ? 'week' : 'weeks'}`
  }
  if (days === 60) return '2 months'
  if (days < 90) {
    const extraDays = days - 60
    if (extraDays === 0) return '2 months'
    const extraWeeks = Math.floor(extraDays / 7)
    const remDays = extraDays % 7
    if (remDays === 0) return `2 months ${extraWeeks} ${extraWeeks === 1 ? 'week' : 'weeks'}`
    if (extraWeeks === 0) return `2 months ${remDays} ${remDays === 1 ? 'day' : 'days'}`
    return `2 months ${extraWeeks} ${extraWeeks === 1 ? 'week' : 'weeks'}`
  }
  if (days === 90) return '3 months'
  return '3+ months'
}

/**
 * Map numeric days to duration schema categories.
 */
export function daysToDurationCategory(days: number): Duration {
  if (days <= 2) return 'weekend'
  if (days <= 6) return '3-5-days'
  return 'week-plus'
}
