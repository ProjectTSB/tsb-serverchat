module.exports = {
    testEnvironment: 'node',
    silent: true,
    moduleFileExtensions: [
        'ts',
        'js'
    ],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    },
    testMatch: [
        '**/tests/**/*.test.ts'
    ],
    moduleNameMapper: {
        '^@/(.+)': '<rootDir>/src/$1'
    }
}
