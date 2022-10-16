const login = require("./login");
const signup = require("./signup");
const setup = require("./setup");
const isSiteSetup = require("./isSiteSetup");
const email = require("./email");
const password = require("./password");

module.exports = {
  ...login,
  ...signup,
  setup,
  isSiteSetup,
  email,
  password,
};
