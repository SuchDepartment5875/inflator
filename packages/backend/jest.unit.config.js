const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  testRegex: "\\.unit.test\\.ts$",
  collectCoverage: true,
  collectCoverageFrom: ["**/*.ts"], // change this to ts only...
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 50,
      lines: 50,
    },
  },
  verbose: true,
};
