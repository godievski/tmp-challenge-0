module.exports = {
  preset: 'jest-expo',
  maxWorkers: 2,
  resolver: '<rootDir>/test/resolver.cjs',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm|react-native|@react-native|expo|@expo|heroui-native|uniwind))',
  ],
};
