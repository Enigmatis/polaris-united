module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    testTimeout: 15000000,
    testMatch: ['**/*.test.ts'],
    coverageDirectory: './coverage/',
};
