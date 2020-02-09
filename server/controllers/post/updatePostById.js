const database = require('../../database');

exports.updatePostById = (req, res, next) => {
	const postId = req.params.postId;
	const postTitle = req.body.title;
	const bodyMarkdown = req.body.bodyMarkdown;
	const categoryId = req.body.categoryId;
	const statusId = req.body.statusId;

	const slug = `${
		postTitle
			.replace(/[^\w\s]/gi, '')
			.replace(/\s\s+/gi, ' ')
			.toLowerCase()
			.split(" ")
			.join("-")
		}-${postId}`

  /**
   * note: do not add memberId and postId
   * inside this query
   */
	database.query(`
    UPDATE post
    SET
      title = '${postTitle}',
      slug = '${slug}',
      body_markdown = '${bodyMarkdown}',
      category_id = '${categoryId}',
      status_id = '${statusId}',
      updated_at = current_timestamp
    WHERE
      post_id = '${postId}'
    RETURNING *
  ;`).then(post => {
		const postData = post.rows[0];

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
