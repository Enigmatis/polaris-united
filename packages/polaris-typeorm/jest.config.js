module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    testTimeout: 1000000,
    testMatch: ['**/*.test.ts'],
    coverageDirectory: './coverage/',
};
