module.exports = {
  clearMocks: false,
  testEnvironment: 'node',
  testMatch: [
    '**/src/test/integ/**/*.test.ts'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  },
  moduleDirectories: ['node_modules', 'src']
}
