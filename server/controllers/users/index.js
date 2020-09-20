const filter = require("./filter");
const userById = require("./userById");
const updateUser = require("./updateUser");
const accessDashboard = require("./accessDashboard");

module.exports = {
	...filter,
	...userById,
	...updateUser,
	...accessDashboard
};
