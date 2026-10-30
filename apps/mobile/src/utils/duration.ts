import type { Duration } from '@travel-planner/shared'

/**
 * Format numeric days into intuitive travel duration copy.
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
  return '3+ weeks'
}

/**
 * Map numeric days to duration schema categories.
 */
export function daysToDurationCategory(days: number): Duration {
  if (days <= 2) return 'weekend'
  if (days <= 6) return '3-5-days'
  return 'week-plus'
}

