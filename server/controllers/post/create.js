// modules
const nanoid = require("nanoid");

const database = require('../../database')

exports.create = (req, res, next) => {
	const postTitle = req.body.title;
	const bodyMarkdown = req.body.bodyMarkdown;
	const memberId = req.body.memberId;

	// generate unique indentification
	const postId = nanoid();

	const slug = `${
		postTitle
			.replace(/[^\w\s]/gi, '')
			.replace(/\s\s+/gi, ' ')
			.toLowerCase()
			.split(" ")
			.join("-")
		}-${postId}`

	database.query(`
	  INSERT INTO
	    post
	      (post_id, title, slug, body_markdown, member_id)
	  VALUES
	    (
	      '${postId}',
	      '${postTitle}',
				'${slug}',
	      '${bodyMarkdown}',
	      '${memberId}'
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
		console.error(error);

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
