module.exports = {
  testMatch: ['**/tests/**/*.test.js'],
  moduleNameMapper: {
    '^../src/index.js$': '<rootDir>/src/feature/index.js',
  },
};
