const _ = require("lodash");
const { validate: validateUUID } = require("uuid");

/**
 * Check value is valid email
 *
 * @param {string} email
 * @returns boolean
 */
const validEmail = (email) =>
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi.test(
		email
	);

/**
 * Check value is valid UUID or not
 *
 * @param {*} value The value to check
 * @returns {*} Returns valid UUID
 */
const validUUID = (value) => {
	if (value == null) {
		return "";
	}

	if (_.isArray(value)) {
		const arr = value.map((item) => (validateUUID(item) ? item : ""));
		const newArr = _.filter(arr);
		return _.isEmpty(newArr) ? "" : newArr;
	}

	if (typeof value === "string") {
		return validateUUID(value) ? value : "";
	}
};

module.exports = {
	validEmail,
	validUUID
};
