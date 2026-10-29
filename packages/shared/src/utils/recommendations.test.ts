import { describe, it, expect } from 'vitest'
import { 
  calculateRecommendationScores, 
  getRecommendations,
  addDiversity 
} from '../utils/recommendations'
import type { Destination, TravelMood, Duration, Budget, TravelParty } from '../types'

const mockDestinations: Destination[] = [
  {
    id: '1',
    slug: 'banff',
    name: 'Banff National Park',
    country: 'Canada',
    region: 'Alberta',
    shortDescription: 'Turquoise lakes and towering peaks',
    description: 'Banff National Park is Canada\'s oldest national park...',
    moodTags: ['nature'],
    categoryTags: ['mountains', 'lakes', 'hiking'],
    estimatedCostMinor: 85000,
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 5,
    highlights: ['Lake Louise', 'Moraine Lake'],
    heroImage: 'https://example.com/banff.jpg',
    isPublished: true,
    popularity: 95,
  },
  {
    id: '2',
    slug: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Kansai',
    shortDescription: 'Ancient temples and traditional gardens',
    description: 'Kyoto served as Japan\'s capital for over 1,000 years...',
    moodTags: ['city'],
    categoryTags: ['temples', 'gardens', 'culture'],
    estimatedCostMinor: 120000,
    costCurrency: 'USD',
    suggestedDaysMin: 3,
    suggestedDaysMax: 5,
    highlights: ['Fushimi Inari', 'Kinkaku-ji'],
    heroImage: 'https://example.com/kyoto.jpg',
    isPublished: true,
    popularity: 92,
  },
  {
    id: '3',
    slug: 'fiji',
    name: 'Fiji Islands',
    country: 'Fiji',
    region: 'South Pacific',
    shortDescription: 'Pristine beaches and coral reefs',
    description: 'Fiji is an archipelago of more than 300 islands...',
    moodTags: ['beach', 'nature'],
    categoryTags: ['beach', 'snorkeling', 'islands'],
    estimatedCostMinor: 180000,
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 7,
    highlights: ['Mamanuca Islands', 'Coral Coast'],
    heroImage: 'https://example.com/fiji.jpg',
    isPublished: true,
    popularity: 82,
  },
  {
    id: '4',
    slug: 'patagonia',
    name: 'Torres del Paine',
    country: 'Chile',
    region: 'Magallanes',
    shortDescription: 'Dramatic peaks and glaciers',
    description: 'Torres del Paine National Park in Chilean Patagonia...',
    moodTags: ['adventure', 'nature'],
    categoryTags: ['trekking', 'mountains', 'glaciers'],
    estimatedCostMinor: 150000,
    costCurrency: 'USD',
    suggestedDaysMin: 5,
    suggestedDaysMax: 8,
    highlights: ['W Trek', 'Grey Glacier'],
    heroImage: 'https://example.com/patagonia.jpg',
    isPublished: true,
    popularity: 80,
  },
]

describe('Recommendation Scoring', () => {
  it('should score nature mood match correctly', () => {
    const preferences = { mood: 'nature' as TravelMood }
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    const banffScore = scores.find(s => s.destinationId === '1')
    const kyotoScore = scores.find(s => s.destinationId === '2')
    
    expect(banffScore?.moodMatch).toBe(100) // Perfect match
    expect(kyotoScore?.moodMatch).toBe(20) // Weak match
  })
  
  it('should score duration fit correctly', () => {
    const preferences = { duration: '3-5-days' as Duration }
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    const banffScore = scores.find(s => s.destinationId === '1')
    const patagoniaScore = scores.find(s => s.destinationId === '4')
    
    expect(banffScore?.durationFit).toBeGreaterThan(patagoniaScore?.durationFit ?? 0)
  })
  
  it('should score budget fit correctly', () => {
    const preferences = { budget: 'budget-friendly' as Budget }
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    const banffScore = scores.find(s => s.destinationId === '1')
    const fijiScore = scores.find(s => s.destinationId === '3')
    
    expect(banffScore?.budgetFit).toBeGreaterThan(fijiScore?.budgetFit ?? 0)
  })
  
  it('should score party fit correctly', () => {
    const preferences = { travelParty: 'solo' as TravelParty }
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    const banffScore = scores.find(s => s.destinationId === '1')
    const kyotoScore = scores.find(s => s.destinationId === '2')
    
    // Solo traveler: nature=0.9, city=0.9
    expect(banffScore?.partyFit).toBe(90)
    expect(kyotoScore?.partyFit).toBe(90)
  })
  
  it('should calculate weighted total score', () => {
    const preferences = { 
      mood: 'nature' as TravelMood,
      duration: '3-5-days' as Duration,
      budget: 'balanced' as Budget,
      travelParty: 'couple' as TravelParty,
    }
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    const banffScore = scores.find(s => s.destinationId === '1')
    
    // mood: 100 * 0.4 = 40
    // duration: 100 * 0.25 = 25
    // budget: 100 * 0.25 = 25
    // party: 90 * 0.1 = 9
    // Total: 99
    expect(banffScore?.score).toBe(99)
  })
  
  it('should handle missing preferences with neutral scores', () => {
    const preferences = {}
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    scores.forEach(score => {
      expect(score.moodMatch).toBe(50)
      expect(score.durationFit).toBe(50)
      expect(score.budgetFit).toBe(50)
      expect(score.partyFit).toBe(50)
    })
  })
  
  it('should sort by score descending', () => {
    const preferences = { mood: 'nature' as TravelMood }
    const scores = calculateRecommendationScores(mockDestinations, preferences)
    
    for (let i = 0; i < scores.length - 1; i++) {
      expect(scores[i].score).toBeGreaterThanOrEqual(scores[i + 1].score)
    }
  })
  
  it('should return top recommendations', () => {
    const preferences = { mood: 'nature' as TravelMood }
    const recommendations = getRecommendations(mockDestinations, preferences, 2)
    
    expect(recommendations.length).toBe(2)
    expect(recommendations[0].id).toBe('1') // Banff (nature)
    expect(recommendations[1].id).toBe('3') // Fiji (beach, nature) - higher popularity than Patagonia
  })
  
  it('should add diversity to recommendations', () => {
    const preferences = { mood: 'nature' as TravelMood }
    const diverse = addDiversity(mockDestinations, preferences, 3)
    
    // Should include destinations from different moods
    const moods = diverse.map(d => d.moodTags[0])
    const uniqueMoods = new Set(moods)
    expect(uniqueMoods.size).toBeGreaterThan(1)
  })
})