module.exports = {
  clearMocks: false,
  testEnvironment: 'node',
  testMatch: [
    '**/src/test/unit/**/*.test.ts'
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
