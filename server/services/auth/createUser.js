// modules
const { v4: uuidv4 } = require("uuid");
const md5 = require("md5");

// database
const database = require("../../database");

// utils
const { hashPassword } = require("../../utils/password");
const logger = require("../../utils/logger");

/**
 * Add user to 'users' database table
 *
 * @param {user} object emailAddress, password, firstname, lastname, isOwner
 */
const createUser = async user => {
	// generate user unique indentification
	const userId = uuidv4(user.emailAddress);

	// get username from email address
	const username = user.emailAddress.split("@")[0];

	const userMd5Hash = md5(user.emailAddress);
	const avatar = `https://www.gravatar.com/avatar/${userMd5Hash}`;

	// password hashing
	const hashedPassword = hashPassword(user.password);
	delete user.password;

	try {
		const getCreateUser = await database
			.insert({
				userId,
				username,
				password: hashedPassword,
				avatar,
				...user,
				createdAt: new Date().toJSON(),
				updatedAt: new Date().toJSON()
			})
			.into("users")
			.returning("*");

		const getFirstUser = getCreateUser[0];
		if (getFirstUser) {
			delete getFirstUser.password;
			delete getFirstUser.createdAt;
			delete getFirstUser.updatedAt;

			return getFirstUser;
		}
		return null;
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};

module.exports = createUser;
