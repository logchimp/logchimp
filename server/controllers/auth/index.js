const login = require("./login");
const signup = require("./signup");
const isSetup = require("./isSetup");
const password = require("./password");

module.exports = {
	...login,
	...signup,
	...isSetup,
	password
};
