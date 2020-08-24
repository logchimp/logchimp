exports.author = (req, res, next) => {
	const authorId = req.body.userId;
	const userId = res.locals.user.userId;

	if (authorId === userId) {
		next();
	} else {
		res.status(403).send({
			status: {
				code: 403,
				type: "error"
			},
			error: {
				code: "insufficient_premissions",
				message: "Insufficient premissions"
			}
		});
	}
};
