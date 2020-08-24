// modules
const jwt = require("jsonwebtoken");

exports.validate = (req, res, next) => {
	const headersToken = req.headers["authorization"];

	if (headersToken) {
		// grab token from headers request
		const token = headersToken.split(" ")[1];

		jwt.verify(token, "secretKey", (err, decoded) => {
			if (err) {
				console.error(err);

				/**
				 * sending response to client
				 * only on if the token is missing
				 */
				res.status(401).send({
					status: {
						code: 401,
						type: "error"
					},
					error: {
						code: "token_invalid",
						message: "Token is invalid"
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
				code: "token_missing",
				message: "Token is missing"
			}
		});
	}
};
