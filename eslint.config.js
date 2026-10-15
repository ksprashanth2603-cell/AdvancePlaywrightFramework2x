const eslint = require('@eslint/js');
const playwright = require('eslint-plugin-playwright');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'logs/**',
      'playwright-report/**',
      'reports/**',
      'test-results/**',
      'tta-report/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    ...playwright.configs['flat/recommended'],
  },
);