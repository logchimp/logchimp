// modules
const uuid = require('uuid/v1');

const database = require('../../database')

exports.create = (req, res, next) => {
	const postTitle = req.body.title;
	const postSlug = req.body.slug;
	const bodyMarkdown = req.body.bodyMarkdown;
	const memberId = req.body.memberId;
	const categoryId = req.body.categoryId;
	const statusId = req.body.statusId;

	// generate unique indentification
	const postId = uuid()

	const postSlugId = `${postSlug}-${Date.now().toString(36)}`

	database.query(`
    INSERT INTO
      post
        (post_id, title, slug, body_markdown, member_id, category_id, status_id)
    VALUES
      (
        '${postId}',
        '${postTitle}',
        '${postSlugId}',
        '${bodyMarkdown}',
        '${memberId}',
        '${categoryId}',
        '${statusId}'
      )
    RETURNING
      post_id, slug
  ;`).then(post => {
		// post data after inserting inside database
		const postData = post.rows[0];

		res.status(200).send({
			status: {
				code: 200,
				type: "success"
			},
			post: {
				postId: postData.post_id,
				slug: postData.slug
			}
		});
	}).catch(error => {
		console.log(error);

		res.status(500).send({
			status: {
				code: 500,
				type: "error"
			},
			error: {
				code: "post_not_created",
				message: "Unable to create post."
			}
		})
	});
}
