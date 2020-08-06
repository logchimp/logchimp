const database = require("../../database");

exports.getPostById = (req, res, next) => {
	const slug = req.params.slug;

	// query specific post data
	database
		.raw(
			`
			SELECT
				post.post_id,
				post.title,
				post.slug,
				post.body_markdown,
				post.member_id,
				post.category_id,
				post.status_id,
				post.vote,
				post.created_at,
				post.updated_at,
				member.first_name,
				member.last_name,
				member.profile_picture
			FROM post
			INNER JOIN member ON member.member_id = post.member_id
			WHERE slug = '${slug}'
		`
		)
		.then(response => {
			const postData = response.rows[0];

			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				post: postData
			});
		})
		.catch(error => {
			console.log(error);

			res.status(404).send({
				status: {
					code: 404,
					type: "error"
				},
				error: {
					code: "post_not_found",
					message: "Post not found."
				}
			});
		});
};
