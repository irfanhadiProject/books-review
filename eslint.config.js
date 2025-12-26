import js from '@eslint/js'

export default [
  js.configs.recommended,

  // Node.js files
  {
    files: ['src/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
      },
    },
  },

  // Browser files
  {
    files: ['public/**/*.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        location: 'readonly',
        console: 'readonly',
      },
    },
  },

  // Test files
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
      },
    },
  },

  // Common rules
  {
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]
