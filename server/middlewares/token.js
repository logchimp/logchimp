// modules
const jwt = require("jsonwebtoken");

exports.validate = (req, res, next) => {
	const headersToken = req.headers["authorization"];

	if (headersToken) {
		const token = headersToken.split(" ")[1];

		if (token) {
			jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
				if (error) {
					res.status(403).send({
						status: {
							code: 403,
							type: "error"
						},
						error: {
							code: "invalid_user_auth_token",
							message: "Invalid user auth token"
						}
					});
				} else {
					// move to next middleware on success
					res.locals.user = decoded;
					next();
				}
			});
		} else {
			res.status(401).send({
				status: {
					code: 401,
					type: "error"
				},
				error: {
					code: "user_auth_token_missing",
					message: "User auth token missing"
				}
			});
		}
	} else {
		res.status(401).send({
			status: {
				code: 401,
				type: "error"
			},
			error: {
				code: "authorization_header_missing",
				message: "'Authorization' header missing"
			}
		});
	}
};
