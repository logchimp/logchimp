// modules
const jwt = require("jsonwebtoken");

exports.createToken = (data, secretKey, payload) => {
	const token = jwt.sign(data, secretKey, payload);
	return token;
};
