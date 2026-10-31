module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    // Shared schemas/types are consumed by the mobile app; `any` would leak
    // into both sides of the codebase.
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
