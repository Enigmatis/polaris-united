module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    testTimeout: 15000000,
    coverageDirectory: './coverage/',
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
};
