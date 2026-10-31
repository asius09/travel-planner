module.exports = {
  root: true,
  extends: ['expo'],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      // Build scripts run in Node, not in the React Native runtime.
      files: ['scripts/**/*.js'],
      env: { node: true },
      parserOptions: { project: null },
    },
    {
      // Vitest/config files are not part of the React Native component tree.
      files: [
        'vitest.config.ts',
        'vitest.setup.ts',
        'vitest.config.mobile.ts',
        'src/test/**/*.ts',
      ],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
}