const database = require('../../database')
const logger = require('../../utils/logger')

const getUserInfo = async (req, res) => {
	const { user_id } = req.params
	const { username, name, notes } = req.body

	try {
		const user = await database
			.update({
				username,
				name,
				notes
			})
			.from('users')
			.where({
				userId: user_id
			})

		res.status(200).send({
			user
		})
	} catch (error) {
		console.log(error)

		logger.error(error)
	}
}

module.exports = getUserInfo
