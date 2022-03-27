module.exports = {
  rules: {
    // Disable eslint-config-airbnb-typescript rules that require
    // `parserServices` to use the Typescript parser, which is much slower.
    //
    // I added manually each set of rules from
    // https://github.com/iamturns/eslint-config-airbnb-typescript/blob/533bdf7b79c54acb93641afb1f8af7dd5e88f97a/lib/shared.js#L66
    // Until `yarn lint` worked again.
    'dot-notation': 2,
    '@typescript-eslint/dot-notation': 0,

    'no-implied-eval': 2,
    'no-new-func': 2,
    '@typescript-eslint/no-implied-eval': 0,

    'no-throw-literal': 2,
    '@typescript-eslint/no-throw-literal': 0,
  },
};
