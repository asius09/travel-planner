// Type declaration for nativewind/preset — the dist file has an empty .d.ts.
// The module exists at runtime; this satisfies the TypeScript compiler.
declare module 'nativewind/preset' {
  import type { Config } from 'tailwindcss'
  const preset: Config
  export default preset
}

