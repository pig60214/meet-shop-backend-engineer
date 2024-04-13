module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/src/routes'
  ],
  setupFiles: ['./jest.env-setup.ts'],
  maxWorkers: 1,
};