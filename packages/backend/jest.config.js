module.exports = {
  // testEnvironment: "node",
  modulePaths: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // testRegex: "\\.test\\.(js|ts)$",
  // moduleFileExtensions: ["ts", "js", "json", "node"],
  testPathIgnorePatterns: ["/_mocks_/", "/node_modules/", "/src/test-utils/"],
  coveragePathIgnorePatterns: ["/src/test-utils/", ".integration.test.ts"],
};
