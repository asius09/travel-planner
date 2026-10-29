import type { Destination, RecommendationInput, RecommendationScore, TravelMood, Duration, Budget, TravelParty } from '../types'

// Scoring weights as defined in DESIGN.md
const WEIGHTS = {
  mood: 0.40,
  duration: 0.25,
  budget: 0.25,
  party: 0.10,
} as const

// Duration mapping to days
const DURATION_DAYS: Record<Duration, { min: number; max: number }> = {
  weekend: { min: 1, max: 2 },
  '3-5-days': { min: 3, max: 5 },
  'week-plus': { min: 7, max: 14 },
  flexible: { min: 1, max: 30 },
}

// Budget mapping to cost ranges (in USD minor units - cents)
const BUDGET_RANGES: Record<Budget, { min: number; max: number }> = {
  'budget-friendly': { min: 0, max: 100000 }, // $0 - $1000
  balanced: { min: 50000, max: 300000 }, // $500 - $3000
  premium: { min: 200000, max: 1000000 }, // $2000 - $10000
  'not-sure': { min: 0, max: 1000000 },
}

// Travel party suitability - simplified for MVP
const PARTY_SUITABILITY: Record<TravelParty, Record<string, number>> = {
  solo: { nature: 0.9, city: 0.9, beach: 0.7, adventure: 0.8 },
  couple: { nature: 0.9, city: 0.8, beach: 0.9, adventure: 0.7 },
  friends: { nature: 0.8, city: 0.9, beach: 0.8, adventure: 0.9 },
  family: { nature: 0.7, city: 0.7, beach: 0.9, adventure: 0.6 },
}

function scoreMoodMatch(destination: Destination, mood?: TravelMood): number {
  if (!mood) return 0.5 // Neutral if no preference
  return destination.moodTags.includes(mood) ? 1 : 0.2 // Strong match or weak match
}

function scoreDurationFit(destination: Destination, duration?: Duration): number {
  if (!duration) return 0.5
  
  const { min: prefMin, max: prefMax } = DURATION_DAYS[duration]
  const { suggestedDaysMin, suggestedDaysMax } = destination
  
  // Check overlap between preferred duration and destination suggestion
  const overlapMin = Math.max(prefMin, suggestedDaysMin)
  const overlapMax = Math.min(prefMax, suggestedDaysMax)
  
  if (overlapMin <= overlapMax) {
    // There's overlap - calculate how good the fit is
    const overlap = overlapMax - overlapMin + 1
    const prefRange = prefMax - prefMin + 1
    return Math.min(1, overlap / prefRange)
  }
  
  // No overlap - check distance
  const prefCenter = (prefMin + prefMax) / 2
  const destCenter = (suggestedDaysMin + suggestedDaysMax) / 2
  const distance = Math.abs(prefCenter - destCenter)
  
  // Decay based on distance
  return Math.max(0.1, 1 - distance / 14)
}

function scoreBudgetFit(destination: Destination, budget?: Budget): number {
  if (!budget) return 0.5
  
  const { min: budgetMin, max: budgetMax } = BUDGET_RANGES[budget]
  const cost = destination.estimatedCostMinor
  
  if (cost >= budgetMin && cost <= budgetMax) {
    return 1
  }
  
  // Outside range - calculate distance from nearest boundary
  const distance = cost < budgetMin ? budgetMin - cost : cost - budgetMax
  const range = budgetMax - budgetMin
  
  return Math.max(0.1, 1 - distance / (range * 2))
}

function scorePartyFit(destination: Destination, party?: TravelParty): number {
  if (!party) return 0.5
  
  // Use the first mood tag for party suitability
  const primaryMood = destination.moodTags[0] as TravelMood
  return PARTY_SUITABILITY[party][primaryMood] ?? 0.5
}

export function calculateRecommendationScores(
  destinations: Destination[],
  preferences: RecommendationInput
): RecommendationScore[] {
  return destinations.map((destination) => {
    const moodMatch = scoreMoodMatch(destination, preferences.mood)
    const durationFit = scoreDurationFit(destination, preferences.duration)
    const budgetFit = scoreBudgetFit(destination, preferences.budget)
    const partyFit = scorePartyFit(destination, preferences.travelParty)
    
    const score = 
      moodMatch * WEIGHTS.mood +
      durationFit * WEIGHTS.duration +
      budgetFit * WEIGHTS.budget +
      partyFit * WEIGHTS.party
    
    return {
      destinationId: destination.id,
      score: Math.round(score * 100),
      moodMatch: Math.round(moodMatch * 100),
      durationFit: Math.round(durationFit * 100),
      budgetFit: Math.round(budgetFit * 100),
      partyFit: Math.round(partyFit * 100),
    }
  }).sort((a, b) => {
    // Primary sort by score descending
    if (b.score !== a.score) return b.score - a.score
    // Tie-breaker: popularity (would need destination data)
    return 0
  })
}

export function getRecommendations(
  destinations: Destination[],
  preferences: RecommendationInput,
  limit: number = 10
): Destination[] {
  const scores = calculateRecommendationScores(destinations, preferences)
  const topIds = new Set(scores.slice(0, limit).map(s => s.destinationId))
  return destinations.filter(d => topIds.has(d.id))
    .sort((a, b) => {
      const scoreA = scores.find(s => s.destinationId === a.id)?.score ?? 0
      const scoreB = scores.find(s => s.destinationId === b.id)?.score ?? 0
      return scoreB - scoreA
    })
}

// Diversity: ensure results don't all have the same mood tag
export function addDiversity(
  destinations: Destination[],
  preferences: RecommendationInput,
  limit: number = 10
): Destination[] {
  const scored = calculateRecommendationScores(destinations, preferences)
  
  // Simple diversity: pick top from each mood, then fill remaining
  const moodGroups = new Map<TravelMood, RecommendationScore[]>()
  scored.forEach(score => {
    // Find destination to get its mood
    const dest = destinations.find(d => d.id === score.destinationId)
    if (dest) {
      const primaryMood = dest.moodTags[0] as TravelMood
      if (!moodGroups.has(primaryMood)) moodGroups.set(primaryMood, [])
      moodGroups.get(primaryMood)!.push(score)
    }
  })
  
  const diverse: RecommendationScore[] = []
  const moods = Array.from(moodGroups.keys())
  
  // Round-robin pick from each mood group
  let round = 0
  while (diverse.length < limit && diverse.length < scored.length) {
    let added = false
    for (const mood of moods) {
      const group = moodGroups.get(mood)!
      if (group.length > round) {
        diverse.push(group[round])
        added = true
      }
    }
    if (!added) break
    round++
  }
  
  // Fill remaining from top scores if needed
  for (const score of scored) {
    if (diverse.length >= limit) break
    if (!diverse.some(d => d.destinationId === score.destinationId)) {
      diverse.push(score)
    }
  }
  
  const topIds = new Set(diverse.slice(0, limit).map(s => s.destinationId))
  return destinations.filter(d => topIds.has(d.id))
    .sort((a, b) => {
      const idxA = diverse.findIndex(s => s.destinationId === a.id)
      const idxB = diverse.findIndex(s => s.destinationId === b.id)
      return idxA - idxB
    })
}