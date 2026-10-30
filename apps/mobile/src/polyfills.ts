import * as Crypto from 'expo-crypto'

// Polyfill Web Crypto API for libraries like @neondatabase/auth and better-auth
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = {}
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = (() => Crypto.randomUUID()) as any
}

if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = ((array: any) => Crypto.getRandomValues(array)) as any
}

