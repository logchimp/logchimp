const database = require('../../database');

exports.deleteById = (req, res, next) => {
	const postId = req.query.postId;

	database.query(`
    DELETE FROM post
    WHERE post_id = '${postId}'
  ;`).then(post => {
		// todo: improve the response output
		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			}
		})
	}).catch(error => {
		console.error(error);

		res.status(500).send({
			status: {
				code: 500,
				type: "error"
			},
			error: {
				code: "post_not_deleted",
				message: "Unable to delete post."
			}
		})
	});
}
