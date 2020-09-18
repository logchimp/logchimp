// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

const database = require("../../database");

exports.create = async (req, res) => {
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;
	const userId = req.body.userId;
	const boardId = req.body.boardId;

	// generate post unique indentification
	const postId = uuidv4(title);

	// generate slug unique indentification
	const slugId = nanoid(20);

	const slug = `${title
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-")}-${slugId}`;

	const createPost = await database
		.insert({
			postId,
			title,
			slug,
			slugId,
			contentMarkdown,
			userId,
			boardId,
			createdAt: new Date().toJSON(),
			updatedAt: new Date().toJSON()
		})
		.into("posts")
		.returning("*");

	try {
		const post = createPost[0];

		if (post) {
			// generate post unique indentification
			const voteId = uuidv4(post.postId);

			const createVote = await database
				.insert({
					voteId,
					userId: post.userId,
					postId: post.postId,
					createdAt: new Date().toJSON()
				})
				.into("votes")
				.returning("*");

			try {
				const vote = createVote[0];

				if (vote) {
					const findUser = await database
						.select("firstname", "lastname", "username", "avatar")
						.from("users")
						.where({
							userId
						})
						.limit(1);

					try {
						const user = findUser[0];

						if (user) {
							res.status(201).send({
								status: {
									code: 201,
									type: "success"
								},
								post,
								voters: user
							});
						}
					} catch (error) {
						console.error(error);
					}
				}
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);

		res.status(500).send({
			status: {
				code: 500,
				type: "error"
			},
			error: {
				code: "post_not_created",
				message: "Unable to create post"
			}
		});
	}
};
