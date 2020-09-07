const userById = require("./userById");
const updateUser = require("./updateUser");
const accessDashboard = require("./accessDashboard");

module.exports = {
	...userById,
	...updateUser,
	...accessDashboard
};
