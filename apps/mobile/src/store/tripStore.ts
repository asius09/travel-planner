import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Destination } from '@travel-planner/shared'

export interface TripDestination {
  id: string
  destinationId: string
  position: number
  addedAt: string
  destination?: Partial<Destination>
}

export interface TripState {
  destinations: TripDestination[]
  addDestination: (destinationId: string, destination?: Partial<Destination>) => boolean
  removeDestination: (destinationId: string) => void
  reorderDestinations: (fromIndex: number, toIndex: number) => void
  setDestinations: (destinations: TripDestination[]) => void
  clearTrip: () => void
  isInTrip: (destinationId: string) => boolean
  getDestinationPosition: (destinationId: string) => number | undefined
  getTotalBudget: () => number
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      destinations: [],
      addDestination: (destinationId: string, destination?: Partial<Destination>) => {
        const { destinations } = get()
        if (destinations.some((d) => d.destinationId === destinationId)) {
          return false
        }
        const newDestination: TripDestination = {
          id: crypto.randomUUID(),
          destinationId,
          position: destinations.length,
          addedAt: new Date().toISOString(),
          destination,
        }
        set({ destinations: [...destinations, newDestination] })
        return true
      },
      removeDestination: (destinationId: string) =>
        set((state) => ({
          destinations: state.destinations
            .filter((d) => d.destinationId !== destinationId)
            .map((d, index) => ({ ...d, position: index })),
        })),
      reorderDestinations: (fromIndex: number, toIndex: number) =>
        set((state) => {
          const newDestinations = [...state.destinations]
          const [removed] = newDestinations.splice(fromIndex, 1)
          newDestinations.splice(toIndex, 0, removed)
          return {
            destinations: newDestinations.map((d, index) => ({ ...d, position: index })),
          }
        }),
      setDestinations: (destinations: TripDestination[]) => set({ destinations }),
      clearTrip: () => set({ destinations: [] }),
      isInTrip: (destinationId: string) =>
        get().destinations.some((d) => d.destinationId === destinationId),
      getDestinationPosition: (destinationId: string) =>
        get().destinations.find((d) => d.destinationId === destinationId)?.position,
      getTotalBudget: () => {
        return get().destinations.reduce((total, item) => {
          return total + (item.destination?.estimatedCostMinor ?? 0)
        }, 0)
      },
    }),
    {
      name: 'travel-planner-trip',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
