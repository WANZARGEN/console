module.exports = {
  root: false,
  env: { browser: true, es2020: true },
  extends: [
      'custom',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: "detect"
    }
  },
  rules: {
    "indent": [ "error", 2],

    // react rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-indent" : ["error", 2],
    "react/jsx-indent-props": "off",
    "react/jsx-one-expression-per-line": "off",
    "react/require-default-props": "warn",
    "react/function-component-definition":[
      2,
      { "namedComponents": [
        "arrow-function",
        "function-declaration"
      ] }
    ],
  },
}
