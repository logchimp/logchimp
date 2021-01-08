const jwt = require("jsonwebtoken");
const database = require("../database");
const error = require("../errorResponse.json");

// utils
const logger = require("../utils/logger");
const logchimpConfig = require("../utils/logchimpConfig");
const config = logchimpConfig();

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
		return res.status(401).send({
			message: error.middleware.auth.invalidToken,
			code: "INVALID_JWT"
		});
	}

	const userId = decoded.payload.userId;

	try {
		const { rows: users } = await database.raw(
			`
				SELECT
					u."userId",
					u.name,
					u.username,
					u.email,
					(
						SELECT
							json_agg(roles)
						FROM
							roles
						WHERE
							roles.id = ru.role_id
					) AS "roles",
					(
						SELECT
							ARRAY_AGG(CONCAT("type", ':', "action"))
						FROM
							permissions
						LEFT JOIN permissions_roles AS pr ON permissions.id = pr.permission_id
						WHERE
							pr.role_id = ru.role_id
					) AS permissions
					FROM
						users AS u
					LEFT JOIN roles_users AS ru ON u."userId" = ru.user_id
					LEFT JOIN permissions_roles AS pr ON ru.role_id = pr.role_id
				WHERE
					"userId" = :userId
				GROUP BY
					u."userId",
					ru.role_id;
			`,
			{
				userId
			}
		);

		const user = users[0];
		if (user) {
			try {
				// validate JWT auth token
				const secretKey = config.server.secretKey;
				jwt.verify(token, secretKey);

				req.user = user;
				next();
			} catch (err) {
				if (
					err.name === "TokenExpiredError" ||
					err.name === "JsonWebTokenError"
				) {
					return res.status(401).send({
						message: error.middleware.auth.invalidToken,
						code: "INVALID_TOKEN",
						err
					});
				}
			}
		} else {
			// user not found
			return res.status(404).send({
				message: error.middleware.user.userNotFound,
				code: "USER_NOT_FOUND"
			});
		}
	} catch (err) {
		logger.error(err);
	}
};

const token = (req, res, next) => {
	// check for authorization header
	if (!req.headers || !req.headers.authorization) {
		return res.status(400).send({
			message: error.middleware.auth.invalidAuthHeader,
			code: "INVALID_AUTH_HEADER"
		});
	}

	// extract token from authorization header
	const token = extractTokenFromHeader(req.headers.authorization);

	if (!token) {
		return res.status(401).send({
			message: error.middleware.auth.invalidAuthHeaderFormat,
			code: "INVALID_AUTH_HEADER_FORMAT"
		});
	}

	authenticateWithToken(req, res, next, token);
};

module.exports = token;
