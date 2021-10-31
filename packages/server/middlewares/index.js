const authenticate = require("./authenticate");
const authorize = require("./authorize");

module.exports.apiAuth = [authenticate, authorize];
