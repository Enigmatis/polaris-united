module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['ts', 'js'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    testTimeout: 150000,
    coverageDirectory: './coverage/',
    projects: ["<rootDir>", "../polaris-test"],
    globals: {
        'ts-jest': {
            diagnostics: false
        }
    }
};
