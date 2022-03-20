module.exports = {
  displayName: "client",
  moduleFileExtensions: ["js", "vue"],
  transform: {
    ".*\\.(js)$": "babel-jest",
    ".*\\.(vue)$": "vue-jest"
  },
  setupFilesAfterEnv: ["./tests/setupTest.js"],
  verbose: true,
  testEnvironment: "jsdom"
};
