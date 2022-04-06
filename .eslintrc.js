module.exports = {
  extends: ['prettier', 'eslint:recommended', 'plugin:react/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      impliedStrict: true,
      classes: true,
      jsx: true,
    },
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
    },
  },
};
