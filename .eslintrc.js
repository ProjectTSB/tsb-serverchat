module.exports = {
    root: true,
    env: {
        node: true,
        es2020: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/errors'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        project: 'tsconfig.json'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        'semi': ['error', 'always'],
        'quotes': ['warn', 'single'],
        'indent': ['warn', 4, { SwitchCase: 1 }],
        'comma-dangle': ['warn', 'never'],
        'curly': ['error', 'multi-line'],
        'no-undef': 'off',
        'brace-style': ['warn', 'stroustrup', { allowSingleLine: true }],
        'space-before-function-paren': ['warn', { anonymous: 'never', named: 'never', asyncArrow: 'always' }],
        'no-multiple-empty-lines': ['error', { 'max': 1 }],
        'camelcase': ['warn', { allow: ['_on'] }],
        'import/no-unresolved': 'off',
        'camelcase': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_' }]
    }
};
