const database = require('../../database')
const logger = require('../../utils/logger')

const getUserInfo = async (req, res) => {
	const { user_id } = req.params

	try {
		const user = await database
			.select(
				'userId',
				'name',
				'username',
				'email',
				'avatar',
				'isVerified',
				'isBlocked',
				'isOwner',
				'notes',
				'createdAt'
			)
			.from('users')
			.where({
				userId: user_id
			})
			.first()

		res.status(200).send({
			user
		})
	} catch (error) {
		console.log(error)

		logger.error(error)
	}
}

module.exports = getUserInfo
