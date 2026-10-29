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
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
}