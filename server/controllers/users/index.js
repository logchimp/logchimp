const userById = require("./userById");
const updateUser = require("./updateUser");

module.exports = {
	...userById,
	...updateUser
};
