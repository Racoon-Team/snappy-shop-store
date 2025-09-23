module.exports = {
  extends: ['next', 'next/core-web-vitals', 'eslint:recommended'],
  rules: {
    // Customize your rules
    'no-console': 'warn',
    'react/jsx-key': 'error',
    'no-unused-vars': 'off',
    semi: ["error", "always"],
  },
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 12, // or 2021
    sourceType: 'module',
  },
};
