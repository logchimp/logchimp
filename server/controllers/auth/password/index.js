const { readSync } = require("fs-extra");
const reset = require("./reset");
const set = require('./set');

module.exports = {
	...reset,
	...set
};
