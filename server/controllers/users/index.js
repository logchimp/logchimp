const filter = require("./filter");
const getProfile = require("./getProfile");
const updateProfile = require("./updateProfile");
const accessDashboard = require("./accessDashboard");

module.exports = {
	...filter,
	getProfile,
	updateProfile,
	...accessDashboard
};
