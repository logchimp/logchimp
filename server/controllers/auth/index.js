const login = require("./login");
const signup = require("./signup");
const isSetup = require("./isSetup");
const email = require("./email");

module.exports = {
	...login,
	...signup,
	...isSetup,
	email
};
