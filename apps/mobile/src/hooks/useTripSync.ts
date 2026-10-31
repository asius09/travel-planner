import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type TripWithItems } from '@/services/api'
import { useTripStore, type TripDestination } from '@/store/tripStore'

/**
 * Keeps the local trip store reconciled with the server. The server is the
 * source of truth for persisted trips; the store provides instant optimistic
 * updates that mutations roll back against when a request fails.
 */
export function useTripSync(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient()
  const setDestinations = useTripStore((state) => state.setDestinations)
  // Guards against a stale response overwriting a newer optimistic update.
  const reconciledRevision = useRef(0)

  const query = useQuery({
    queryKey: ['trip'],
    queryFn: () => api.getTrip(),
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  })

  useEffect(() => {
    const data: TripWithItems | undefined = query.data
    if (!data) return

    const revision = data.updatedAt ? Date.parse(data.updatedAt) : 0
    if (revision && revision < reconciledRevision.current) return

    const serverItems: TripDestination[] = data.items.map((item) => ({
      id: item.id,
      destinationId: item.destinationId,
      position: item.position,
      addedAt: item.addedAt,
      destination: item.destination ?? undefined,
    }))

    const local = useTripStore.getState().destinations
    const sameOrder =
      local.length === serverItems.length &&
      local.every((item, index) => item.destinationId === serverItems[index]?.destinationId)

    if (!sameOrder) {
      reconciledRevision.current = revision
      setDestinations(serverItems)
    }
  }, [query.data, setDestinations])

  return {
    ...query,
    /** Invalidate after a confirmed mutation so the next render uses server state. */
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['trip'] }),
  }
}
