const login = require("./login");
const signup = require("./signup");
const isSiteSetup = require("./isSiteSetup");
const email = require("./email");
const password = require("./password");

module.exports = {
	...login,
	...signup,
	isSiteSetup,
	email,
	password
};
