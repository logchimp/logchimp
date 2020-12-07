const filter = require("./filter");
const updateUser = require("./updateUser");
const getProfile = require("./getProfile");
const accessDashboard = require("./accessDashboard");

module.exports = {
	...filter,
	updateUser,
	getProfile,
	...accessDashboard
};
