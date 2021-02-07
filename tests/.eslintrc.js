module.exports = {
    extends: [
        'plugin:jest/recommended'
    ],
    plugins: [
        'jest'
    ],
    rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
    }
}
