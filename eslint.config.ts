import antfu from '@antfu/eslint-config'

export default antfu(
  {
  },
  {
    files: ['**/*.js', '**/*.ts'],
    rules: {
      'node/prefer-global/process': 'off',
      'no-console': 'off',
      'ts/no-use-before-define': 'off',
      'unused-imports/no-unused-vars': ['error', {
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }],
      'curly': ['error', 'all'],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
)
