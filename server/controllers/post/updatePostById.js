const database = require('../../database');

exports.updatePostById = (req, res, next) => {
	const postId = req.params.postId;
	const postTitle = req.body.title;
	const postSlug = req.body.slug;
	const bodyMarkdown = req.body.bodyMarkdown;
	const categoryId = req.body.categoryId;
	const statusId = req.body.statusId;

  /**
   * note: do not add memberId and postId
   * inside this query
   */
	database.query(`
    UPDATE post
    SET
      title = '${postTitle}',
      slug = '${postSlug}',
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
		console.log(error);
	});
}
