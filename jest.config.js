const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp|bmp)$":
      "<rootDir>/__mocks__/fileMock.js",
    "^lucide-react$": "<rootDir>/__mocks__/lucide-react.js",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**",
    "!src/types/**",
    "!src/data/**",
    "!src/lib/**",
  ],
  coverageReporters: ["text", "lcov", "html"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/backend/",
    "<rootDir>/contracts-offerhub/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(lucide-react|@radix-ui|@testing-library)/)",
  ],
  // Use Next.js built-in SWC transformer
  // transform: {
  //   '^.+\\.(ts|tsx)$': 'ts-jest',
  //   '^.+\\.(js|jsx)$': 'babel-jest',
  // },
  // Remove custom transform - let Next.js Jest handle it
  // extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
