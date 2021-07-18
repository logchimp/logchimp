const _ = require("lodash");
const { validate: validateUUID } = require("uuid");

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
	validUUID
};
