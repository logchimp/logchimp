const _ = require("lodash");
const { validate: validateUUID } = require("uuid");
const bcrypt = require("bcryptjs");

/**
 * Check value is valid email
 *
 * @param {string} email
 * @returns boolean
 */
const validEmail = email =>
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi.test(
		email
	);

/**
 * Check value is valid UUID or not
 *
 * @param {*} value The value to check
 * @returns {*} Returns valid UUID
 */
const validUUID = value => {
	if (value == null) {
		return "";
	}

	if (_.isArray(value)) {
		const arr = value.map(item => (validateUUID(item) ? item : ""));
		const newArr = _.filter(arr);
		return _.isEmpty(newArr) ? "" : newArr;
	}

	if (typeof value === "string") {
		return validateUUID(value) ? value : "";
	}
};

/**
 * Create random 6 digital HEX color
 *
 * @returns Return HEX color
 */
const generateHexColor = () => {
	let random = Math.random();
	const exponent = --random.toExponential().split("-")[1];
	// Make sure random number is between 1.0 and 0.1 to assure correct hex values.
	random *= Math.pow(10, exponent);
	return (~~(random * (1 << 24))).toString(16);
};

/**
 * Generate hased password
 *
 * @param {string} value password to be hashed
 * @returns Return hash password
 */
const hashPassword = value => {
	if (_.isEmpty(value)) {
		return null;
	}

	const bcryptSaltRounds = 10;
	const bcryptSalt = bcrypt.genSaltSync(bcryptSaltRounds);
	const hashPassword = bcrypt.hashSync(value, bcryptSalt);
	return hashPassword;
}

/**
 * Validate hashed pasword
 *
 * @param {string} password string password
 * @param {string} hash hashed password
 * @returns {boolean} Return boolean value
 */
const validatePassword = (password, hash) => {
	if (_.isEmpty(password && hash)) {
		return null;
	}

 	if (!_.isString(password && hash)) {
		return null;
	}

	return bcrypt.compareSync(password, hash);
};


module.exports = {
	validEmail,
	validUUID,
	generateHexColor,
	hashPassword,
	validatePassword
};