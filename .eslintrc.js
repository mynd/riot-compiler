module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'no-prototype-builtins': 'off',
  },
}
