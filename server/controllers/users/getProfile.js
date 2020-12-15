module.exports = async (req, res) => {
	const user = req.user;

	res.status(200).send({
		user: {
			userId: user.userId,
			name: user.name,
			username: user.username,
			email: user.email
		}
	});
};
