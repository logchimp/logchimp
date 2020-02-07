// modules
const uuid = require('uuid/v1');

const database = require('../../database');

exports.upvote = (req, res, next) => {
	const postId =  req.body.postId;
	const memberId = req.body.memberId;

	// generate unique indentification
	const voteId = uuid();

	database.query(`
		INSERT INTO
			vote
				(
					vote_id, post_id, member_id
				)
		VALUES
			(
				'${voteId}',
				'${postId}',
				'${memberId}'
			)
	;`).then(response => {
		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			}
		})
	}).catch(error => {
		console.error(error);
	});
}
