/**
 * Minimal, accurate declarations for the parts of `@neondatabase/auth` this app
 * uses. The published package ships no type declarations for its client export
 * (only `./dist/ui/css.d.ts`), which previously forced `as any` at every call
 * site. Declaring the real surface fixes the underlying type gap.
 */
declare module '@neondatabase/auth' {
  interface NeonAuthUser {
    id: string
    email: string
    name?: string | null
    emailVerified?: boolean
    image?: string | null
    createdAt: Date | string
    updatedAt?: Date | string
  }

  interface NeonAuthSession {
    id: string
    token: string
    expiresAt: Date | string
    userId?: string
  }

  interface NeonAuthSessionResult {
    data?: { session: NeonAuthSession | null; user: NeonAuthUser | null } | null
    error?: { message: string; status?: number } | null
  }

  interface NeonAuthSignInResult {
    data?: { session: NeonAuthSession | null; user: NeonAuthUser | null } | null
    error?: { message: string; status?: number } | null
  }

  export interface NeonAuthClient {
    signUp: {
      email: (credentials: {
        email: string
        password: string
        name?: string
        image?: string
      }) => Promise<NeonAuthSignInResult>
    }
    signIn: {
      email: (credentials: { email: string; password: string }) => Promise<NeonAuthSignInResult>
    }
    signOut: () => Promise<unknown>
    getSession: () => Promise<NeonAuthSessionResult>
  }

  export function createAuthClient(
    baseUrl: string,
    options?: Record<string, unknown>,
  ): NeonAuthClient
}
