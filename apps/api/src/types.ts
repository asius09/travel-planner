export interface AuthUser {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  createdAt: Date
}

export interface AuthSession {
  id: string
  token: string
  expiresAt: Date
}

/** Hono environment shared by every router. */
export type AppEnv = {
  Variables: {
    user: AuthUser
    session: AuthSession
  }
}

/**
 * OpenAPI security requirement: a bearer token or a session cookie.
 *
 * Kept as an annotated constant on purpose. Written inline, TypeScript infers
 * `({ Bearer: never[] } | { Cookie: never[] })[]`, which does not match the
 * `Record<string, string[]>` index signature and makes `createRoute` lose its
 * literal inference - every `c.req.valid(...)` in the handler then resolves to
 * `never`.
 */
export const authSecurity: Record<string, string[]>[] = [{ Bearer: [] }, { Cookie: [] }]
