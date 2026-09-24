/**
 * QUVANTI - JEST CONFIGURATION
 * Unit and Integration Testing Setup
 *
 * Test Types:
 * - Unit: Individual function testing
 * - Integration: API route testing with mocked database
 * - Coverage: Aim for 80%+ on critical paths
 */

module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "src/app/api/**/*.js",
    "!src/app/api/**/*.test.js",
    "!src/app/api/**/__tests__/**",
    "src/middleware.js",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
    "./src/app/api/utils/": {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,
  verbose: true,
  maxWorkers: "50%", // Use 50% of CPU cores for parallel testing

  // Mock handling
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};



