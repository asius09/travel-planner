import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface TripDestination {
  id: string
  destinationId: string
  position: number
  addedAt: string
}

export interface TripState {
  destinations: TripDestination[]
  addDestination: (destinationId: string) => boolean
  removeDestination: (destinationId: string) => void
  reorderDestinations: (fromIndex: number, toIndex: number) => void
  clearTrip: () => void
  isInTrip: (destinationId: string) => boolean
  getDestinationPosition: (destinationId: string) => number | undefined
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      destinations: [],
      addDestination: (destinationId: string) => {
        const { destinations } = get()
        if (destinations.some((d) => d.destinationId === destinationId)) {
          return false
        }
        const newDestination: TripDestination = {
          id: crypto.randomUUID(),
          destinationId,
          position: destinations.length,
          addedAt: new Date().toISOString(),
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
      clearTrip: () => set({ destinations: [] }),
      isInTrip: (destinationId: string) =>
        get().destinations.some((d) => d.destinationId === destinationId),
      getDestinationPosition: (destinationId: string) =>
        get().destinations.find((d) => d.destinationId === destinationId)?.position,
    }),
    {
      name: 'travel-planner-trip',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)