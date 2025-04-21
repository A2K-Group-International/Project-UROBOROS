export default {
  testEnvironment: "jest-environment-jsdom", // Use the installed package
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest", // Use Babel to transform JS/JSX files
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Adjust for your alias setup
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"], // Add Jest DOM matchers
};
