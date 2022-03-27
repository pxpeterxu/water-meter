const confusingBrowserGlobals = require('confusing-browser-globals');

const importExtensions = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.d.ts',
  '.native.ts',
  '.native.tsx',
];

/**
 * Used for @typescript-eslint/ban-types rule. See default options. We copy it
 * over to only disable one set of rules: the ones for `{}`, which the Node
 * and other typings use often.
 *
 * https://github.com/typescript-eslint/typescript-eslint/blob/c72ba77/packages/eslint-plugin/docs/rules/ban-types.md#default-options
 */
const bannedTypes = {
  String: {
    message: 'Use string instead',
    fixWith: 'string',
  },
  Boolean: {
    message: 'Use boolean instead',
    fixWith: 'boolean',
  },
  Number: {
    message: 'Use number instead',
    fixWith: 'number',
  },
  Symbol: {
    message: 'Use symbol instead',
    fixWith: 'symbol',
  },

  Function: {
    message: [
      'The `Function` type accepts any function-like value.',
      'It provides no type safety when calling the function, which can be a common source of bugs.',
      'It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.',
      'If you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
    ].join('\n'),
  },

  // object typing
  Object: {
    message: [
      'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
      '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
      '- If you want a type meaning "any value", you probably want `unknown` instead.',
    ].join('\n'),
  },
  object: {
    message: [
      'The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).',
      'Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys.',
    ].join('\n'),
  },
};

/**
 * Mostly copied from the default AirBnB Typescript config, but allowing
 * leading underscores.
 *
 * https://github.com/iamturns/eslint-config-airbnb-typescript/blob/533bdf7b79c54acb93641afb1f8af7dd5e88f97a/lib/shared.js#L37
 */
const namingConventions = [
  // Allow camelCase variables (23.2), PascalCase variables (23.8), and UPPER_CASE variables (23.10)
  {
    selector: 'variable',
    format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
    leadingUnderscore: 'allow',
  },
  // Allow camelCase functions (23.2), and PascalCase functions (23.8)
  {
    selector: 'function',
    format: ['camelCase', 'PascalCase'],
    leadingUnderscore: 'allow',
  },
  // Airbnb recommends PascalCase for classes (23.3), and although Airbnb does not make TypeScript recommendations, we are assuming this rule would similarly apply to anything "type like", including interfaces, type aliases, and enums
  {
    selector: 'typeLike',
    format: ['PascalCase'],
    leadingUnderscore: 'allow',
  },
];

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    node: true,
    jest: true,
  },

  plugins: ['react', '@typescript-eslint'],

  settings: {
    'import/extensions': importExtensions,
    'import/resolver': { node: { extensions: importExtensions } },
  },

  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/react',
    'plugin:react-hooks/recommended',
    `${__dirname}/eslintrc.noTsParser.js`,
  ],

  overrides: [
    {
      files: [
        '*.test.ts',
        '*.stories.tsx',
        'server/scripts/**',
        'tests/**',
        'sysadmin/**',
      ],
      rules: {
        'no-console': 0,
      },
    },
  ],

  rules: {
    // We use x != null to check if x !== null || x !== undefined
    eqeqeq: [2, 'allow-null'],
    'no-trailing-spaces': 2,
    // We use __BLAH__ to mark superglobals, and _blah for unused variables
    'no-underscore-dangle': 0,
    // We use if (X) { return blah }; else { ... } a lot: it's mostly a style thing
    'no-else-return': 0,
    // To come up with new rules for `no-restricted-syntax`, paste your syntax
    // into https://astexplorer.net/ and see what statements come out. Then,
    // form that into an AST selector per https://eslint.org/docs/developer-guide/selectors
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    // Functions and classes are hoisted, so can be used in any order. We also
    // use variables defined later in the file from functions, mostly for
    // const style = StyleSheet.create directives
    'no-use-before-define': 0, // Rely on the Typescript version
    '@typescript-eslint/no-use-before-define': [
      2,
      { functions: false, classes: true, variables: false },
    ],
    // We use x++ extensively, and it's not too harmful
    'no-plusplus': 0,
    // Destructuring (const { blah } = obj; vs. const blah = obj.blah;) really doesn't make much of a difference
    'prefer-destructuring': 0,
    // Disallow console.log, but allow warn/error and in specific folders via overrides
    'no-console': [2, { allow: ['warn', 'error'] }],
    // We prefer classes to stateless functions because they can be PureComponents. Eventually, we may want to switch to React.memo
    'react/prefer-stateless-function': 0,
    // We're okay with having apostrophes, quotes, etc. be unescaped in React code: it's Javascript, so we can include UTF-8
    'react/no-unescaped-entities': 0,
    'import/first': 0, // For mocks, mocks must come first
    'import/no-cycle': 0, // We often have dependency cycles right now, especially for types
    'import/prefer-default-export': 0, // Files often have one function
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        ignoreRestSiblings: true,
        // Allow unused variables starting with an underscore, but disallow
        // unused '_' (which is what we often import lodash as)
        varsIgnorePattern: '^_.',
        argsIgnorePattern: '^_.',
      },
    ],
    'react/destructuring-assignment': 0, // We often use this.props.X directly
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'eslintrc*',
          '**/*.test.*',
          '**/*.stories.*',
          'server/scripts/db.ts',
          '**/tests/**',
          'gulpfile*',
          'mobile/storybook/**/*',
          '**/__mocks__/**',
          'sysadmin/**',
          'server/scripts/**',
          'mobile/storybook/**',
        ],
      },
    ],
    'jsx-a11y/label-has-associated-control': 0, // This rule seems flaky
    'react/no-did-update-set-state': 0, // We do setState in componentDidUpdate as an alternative to componentWillReceiveProps
    'react/no-access-state-in-setstate': 0, // This is mostly fine, and addressing this actually makes the code harder to read
    'react/jsx-no-target-blank': 0, // We only want noopener, not noreferrer for target="_blank"
    'lines-between-class-members': 0, // We often put related class members in React components together

    // We like our React defaultProps defined as `static defaultProps = { ... }` in the class
    'react/static-property-placement': [2, 'static public field'],
    // We spread props to avoid having to repeatedly pass lots of props down. This is a bit worse
    // for performance and typechecking though, so there is a trade-off (e.g., if we accidentally
    // pass props that aren't needed but cause re-renders)
    'react/jsx-props-no-spreading': 0,
    // We initialize state:
    // - In the constructor if we need to do something else in the constructor
    // - In the class body (state: State = {...}) if otherwise there's no constructor work needed
    // Since there's no version of this rule that accommodates that, we disable it
    'react/state-in-constructor': 0,
    // In quite a few places (e.g., FakeData), we both export individual functions and
    // the functions again in the default export. This avoids warning against using one
    // or the other
    'import/no-named-as-default-member': 0,
    // We don't sort components, except making sure that render comes at the end
    'react/sort-comp': [
      2,
      {
        order: ['everything-else', '/^render[A-Z].+$/', 'render'],
      },
    ],
    // Airbnb doesn't allow using isNaN, but isNaN and isFinite are safe with
    // type-checking. We just use them
    'no-restricted-globals': [2, ...confusingBrowserGlobals],
    // We like putting methods near where they're used, and that might be inside
    // a class even if they don't use `this`
    'class-methods-use-this': 0,
    // We nest ternaries in render() methods for React so that we can do more
    // complex decision trees
    'no-nested-ternary': 0,
    // Template strings are not necessarily more readable
    'prefer-template': 0,
    // Most boolean values are flags; however, sometimes, boolean values are used
    // in the `value` prop and are significant
    'react/jsx-boolean-value': [2, 'never', { always: ['value'] }],
    // We don't use React PropTypes since we're on Typescript
    'react/prop-types': 0,
    // We rely on Typescript inferred function return types a lot:
    // it's just easier without any loss of correctness
    '@typescript-eslint/explicit-function-return-type': 0,
    // We often have to cast .id! for Sequelize models as we don't require
    // it on creation, but on `find`s it always has it
    '@typescript-eslint/no-non-null-assertion': 0,
    // Namespaces are not supported by Babel unless they're
    // `declare namespace XXX`, which can only contain types. They
    // help us encapsulate a bunch of types without polluting
    // the global autocomplete
    '@typescript-eslint/no-namespace': [2, { allowDeclarations: true }],
    // We use any casts as intermediate casts a bunch. We may want to
    // convert more of these to `unknown` casts
    '@typescript-eslint/no-explicit-any': 0,
    // We often do `interface Props extends SomeOtherProps {}` in React
    // components
    '@typescript-eslint/no-empty-interface': 0,
    // Even if types are inferrable, we want to have the option of being
    // more explicit when we want to
    '@typescript-eslint/no-inferrable-types': 0,
    // We like to save some typing by not explicitly typing out many functions
    '@typescript-eslint/explicit-module-boundary-types': 0,
    // This override keeps most of the default banned types, but unbans `{}`,
    // which is used by a log of typings we consume.
    '@typescript-eslint/ban-types': [
      2,
      { types: bannedTypes, extendDefaults: false },
    ],
    // We allow `as 'my string'` casts since they used to be unchecked
    '@typescript-eslint/prefer-as-const': 0,
    // We allow class members to not have lines in between for denser
    // lists of variables at the top of classes
    '@typescript-eslint/lines-between-class-members': 0,
    // We override this to allow leading underscores
    '@typescript-eslint/naming-convention': [2, ...namingConventions],
    // We use `require` for assets, Jest mocks, and more
    '@typescript-eslint/no-var-requires': 0,
  },
};
