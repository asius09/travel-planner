import * as Crypto from 'expo-crypto'

// Polyfill Web Crypto API for libraries like @neondatabase/auth and better-auth

/** Minimal shape of the Web Crypto API the auth libraries depend on. */
interface MinimalWebCrypto {
  randomUUID?: () => string
  getRandomValues?: typeof Crypto.getRandomValues
}

const crypto = globalThis as unknown as { crypto?: MinimalWebCrypto }

if (!crypto.crypto) {
  crypto.crypto = {}
}

// `expo-crypto` implements the same signatures as the Web Crypto API, so its
// functions can be assigned directly without any cast.
if (crypto.crypto.randomUUID === undefined) {
  crypto.crypto.randomUUID = Crypto.randomUUID
}

if (crypto.crypto.getRandomValues === undefined) {
  crypto.crypto.getRandomValues = Crypto.getRandomValues
}
