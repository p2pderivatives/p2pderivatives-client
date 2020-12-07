module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/integration-test/run-separate/*.test.ts'],
  setupFilesAfterEnv: ['./integration-test/jest.setup.js'],
  coverageReporters: ['json', 'lcov']
}
