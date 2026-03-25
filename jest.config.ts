import type { Config } from "jest";

const esModules = ["jose"].join("|");

const config: Config = {
  displayName: "eight-canal-base",
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.json",
    }],
    [`node_modules/(${esModules})/.+\\.js$`]: ["ts-jest", {
      tsconfig: "tsconfig.json",
    }],
  },
  transformIgnorePatterns: [
    `<rootDir>/node_modules/(?!(${esModules})/)`,
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  testMatch: [
    "<rootDir>/__tests__/**/*.test.{ts,tsx}",
  ],
};

export default config;
