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
		console.log(error);
	});
}
