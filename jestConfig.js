module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'config/**/*.js',
    'reporters/**/*.js',
    'scripts/aggregate-themes/**/*.js',
    'scripts/wdio/clean-screenshots.js',
  ],
  coverageDirectory: 'tests/jest/reports/coverage',
  coverageReporters: [
    'html',
    'text',
    'lcov',
    'cobertura',
    'text-summary',
  ],
  testMatch: [
    '**/jest/**/(*.)(spec|test).js?(x)',
  ],
  reporters: [
    'default',
    '<rootDir>/reporters/jest/TerraVerboseReporter.js',
  ],
  roots: [process.cwd()],
  testURL: 'http://localhost',
};
