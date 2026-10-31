import React from 'react'
import { useFocusEffect } from 'expo-router'

/**
 * Refetches a query when the React Native screen regains focus.
 * Skips the initial mount invocation since useFocusEffect runs on mount as well.
 */
export function useRefreshOnFocus<T>(refetch: () => Promise<T> | void) {
  const firstTimeRef = React.useRef(true)

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false
        return
      }

      refetch()
    }, [refetch]),
  )
}
