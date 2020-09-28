const jwt = require("jsonwebtoken");
const database = require("../database");
const error = require("../errorResponse.json");

// utils
const logger = require("../../utils/logger");

const extractTokenFromHeader = header => {
	const [scheme, token] = header.split(" ");

	if (/^Bearer$/i.test(scheme)) {
		return token;
	}
};

const authenticateWithToken = async (req, res, next, token) => {
	const decoded = jwt.decode(token, { complete: true });

	// validate JWT token type
	if (!decoded || !decoded.header) {
		res.status(401).send({
			message: error.middleware.auth.invalidToken,
			code: "INVALID_JWT"
		});
		return;
	}

	const userId = decoded.payload.userId;
	const users = await database
		.select()
		.from("users")
		.where({ userId })
		.limit(1);

	const user = users[0];

	if (user) {
		if (!user.isBlocked) {
			try {
				// validate JWT auth token
				jwt.verify(token, process.env.SECRET_KEY);
				next();
			} catch (err) {
				logger.log({
					level: "error",
					message: err
				});

				if (
					err.name === "TokenExpiredError" ||
					err.name === "JsonWebTokenError"
				) {
					res.status(401).send({
						message: err.middleware.auth.invalidToken,
						code: "INVALID_TOKEN",
						err
					});
					return;
				}
			}
		} else {
			// user is blocked
			res.status(403).send({
				message: error.middleware.user.userBlocked,
				code: "USER_BLOCKED"
			});
			return;
		}
	} else {
		// user not found
		res.status(401).send({
			message: error.middleware.user.userNotFound,
			code: "USER_NOT_FOUND"
		});
		return;
	}
};

const token = (req, res, next) => {
	// check for authorization header
	if (!req.headers || !req.headers.authorization) {
		res.status(400).send({
			message: error.middleware.auth.invalidAuthHeader,
			code: "INVALID_AUTH_HEADER"
		});
		return;
	}

	// extract token from authorization header
	const token = extractTokenFromHeader(req.headers.authorization);

	if (!token) {
		res.status(401).send({
			message: error.middleware.auth.invalidAuthHeaderFormat,
			code: "INVALID_AUTH_HEADER_FORMAT"
		});
		return;
	}

	authenticateWithToken(req, res, next, token);
};

module.exports = token;
