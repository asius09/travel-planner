import { describe, it, expect } from 'vitest'
import { create } from 'zustand'

interface CounterState {
  count: number
  inc: () => void
}

describe('Zustand Test', () => {
  it('should import zustand', () => {
    const store = create<CounterState>((set) => ({
      count: 0,
      inc: () => set((state) => ({ count: state.count + 1 })),
    }))
    expect(store.getState().count).toBe(0)
    store.getState().inc()
    expect(store.getState().count).toBe(1)
  })
})