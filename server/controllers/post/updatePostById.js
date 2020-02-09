const database = require('../../database');

exports.updatePostById = (req, res, next) => {
	const postId = req.params.postId;
	const postTitle = req.body.title;
	const slugId = req.body.slugId;
	const bodyMarkdown = req.body.bodyMarkdown;

	const slug = `${
		postTitle
			.replace(/[^\w\s]/gi, '')
			.replace(/\s\s+/gi, ' ')
			.toLowerCase()
			.split(" ")
			.join("-")
		}-${slugId}`

  /**
   * note: do not add memberId and postId
   * inside this query
   */
	database
		.update({
			title: postTitle,
			slug,
			slug_id: slugId,
			body_markdown: bodyMarkdown,
			updated_at: new Date()
		})
		.from("post")
		.where({
			post_id: postId
		})
		.returning('*')
		.then(post => {
			const postData = post[0];

			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				post: postData
			})
		}).catch(error => {
			console.error(error);
		});
}
