export const MOOD_OPTIONS = [
  { value: 'nature', label: 'Nature', description: 'Forests, mountains, lakes', icon: 'leaf-outline' },
  { value: 'city', label: 'City & culture', description: 'Architecture, streets, markets', icon: 'business-outline' },
  { value: 'beach', label: 'Beach', description: 'Coastlines, islands, turquoise water', icon: 'sunny-outline' },
  { value: 'adventure', label: 'Adventure', description: 'Trails, rugged peaks, outdoor activity', icon: 'footsteps-outline' },
] as const

export const DURATION_OPTIONS = [
  { value: 'weekend', label: 'Weekend', description: '1–2 days' },
  { value: '3-5-days', label: '3–5 days', description: 'Short getaway' },
  { value: 'week-plus', label: 'A week or more', description: '7+ days' },
  { value: 'flexible', label: 'Not sure yet', description: 'Flexible dates' },
] as const

export const BUDGET_OPTIONS = [
  { value: 'budget-friendly', label: 'Budget-friendly', description: 'Keep costs low' },
  { value: 'balanced', label: 'Balanced', description: 'Good value for money' },
  { value: 'premium', label: 'Premium', description: 'Comfort and quality' },
  { value: 'not-sure', label: 'Not sure yet', description: 'Open to options' },
] as const

export const TRAVEL_PARTY_OPTIONS = [
  { value: 'solo', label: 'Solo', description: 'Just me' },
  { value: 'couple', label: 'Couple', description: 'Two people' },
  { value: 'friends', label: 'Friends', description: 'Group of friends' },
  { value: 'family', label: 'Family', description: 'With children' },
] as const

export const CATEGORY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'nature', label: 'Nature' },
  { value: 'city', label: 'City' },
  { value: 'beach', label: 'Beach' },
  { value: 'adventure', label: 'Adventure' },
] as const