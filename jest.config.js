export default {
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    "./src/test-utils/setup-after-env.ts"
  ],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: [".d.ts", ".js"]
};