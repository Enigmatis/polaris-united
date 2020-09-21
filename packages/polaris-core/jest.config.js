module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    projects: ["<rootDir>", "../polaris-test"],
    testMatch: ['**/*.test.ts'],
    testTimeout: 150000,
    coverageDirectory: './coverage/',
};
