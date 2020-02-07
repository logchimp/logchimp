// modules
const uuid = require('uuid/v1');

const database = require('../../database')

exports.create = (req, res, next) => {
	const postTitle = req.body.title;
	const postSlug = req.body.slug;
	const bodyMarkdown = req.body.bodyMarkdown;
	const memberId = req.body.memberId;

	// generate unique indentification
	const postId = uuid()

	const postSlugId = `${postSlug}-${Date.now().toString(36)}`

	database.query(`
	  INSERT INTO
	    post
	      (post_id, title, slug, body_markdown, member_id)
	  VALUES
	    (
	      '${postId}',
	      '${postTitle}',
	      '${postSlugId}',
	      '${bodyMarkdown}',
	      '${memberId}'
	    )
	  RETURNING
	    post_id, slug
	;`).then(post => {
		// post data after inserting inside database
		const postData = post.rows[0];

		// generate unique indentification
		const voteId = uuid()

		/**
		 * after saving post to post table
		 * by-default add one upvote from the author of the post
		 */
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
	;`).then(vote => {

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
