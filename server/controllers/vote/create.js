// modules
const uuid = require('uuid/v1');

const database = require('../../database');

exports.create = (req, res, next) => {
	const postId = req.body.postId;
	const memberId = req.body.memberId;

	// generate unique indentification
	const voteId = uuid()

	database.query(`
		INSERT INTO
			vote
				(vote_id, post_id, member_id)
		VALUES
			(
				'${voteId}',
				'${postId}',
				'${memberId}'
			)
		RETURNING
			vote_id, post_id, member_id
	;`).then(response => {
		console.log(response);
		next();
	}).catch(error => {
		console.error(error);
	});
}
