const login = require("./login");
const signup = require("./signup");
const isSetup = require("./isSetup");

module.exports = {
	...login,
	...signup,
	...isSetup
};
