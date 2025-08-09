// eslint.config.cjs - ESLint v9 Flat Config for Nuxt 3/4 + Vue 3 + TS + Tailwind + Prettier
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const vue = require('eslint-plugin-vue');
const js = require('@eslint/js');
const tailwind = require('eslint-plugin-tailwindcss');
const prettier = require('eslint-config-prettier');

module.exports = [
  // Ignore generated/build folders
  { ignores: ['.nuxt/**', 'dist/**', 'node_modules/**'] },

  // Base JS rules
  js.configs.recommended,

  // Vue 3
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    languageOptions: {
      parser: require('vue-eslint-parser'),
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
      '@typescript-eslint': tseslint,
      tailwindcss: tailwind,
    },
    rules: {
      // Vue
      ...vue.configs['vue3-recommended'].rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',

      // Tailwind
      ...tailwind.configs.recommended.rules,
      'tailwindcss/no-custom-classname': 'off',

      // Prettier (turn off conflicting stylistic rules)
      ...prettier.rules,
    },
  },
];
