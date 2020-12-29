const filter = require("./filter");
const getProfile = require("./getProfile");
const updateProfile = require("./updateProfile");
const accessDashboard = require("./accessDashboard");
const getUserPermissions = require("./getUserPermissions");

module.exports = {
	...filter,
	getProfile,
	updateProfile,
	...accessDashboard,
	getUserPermissions
};
