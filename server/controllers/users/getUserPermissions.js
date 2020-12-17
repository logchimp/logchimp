module.exports = async (req, res) => {
	const user = req.user;

	res.status(200).send({
		roles: user.roles,
		permissions: user.permissions
	});
};
