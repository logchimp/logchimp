// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

const database = require("../../database");

// utils
const logger = require("../../utils/logger");

const error = require("../../errorResponse.json");

exports.create = async (req, res) => {
	const permissions = req.user.permissions;
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;
	const boardId = req.body.boardId;
	const userId = req.user.userId;

	const createPostPermission = permissions.find(item => item === "post:create");
	if (!createPostPermission) {
		return res.status(403).send({
			message: error.api.posts.notEnoughPermission,
			code: "NOT_ENOUGH_PERMISSION"
		});
	}

	if (!title || !boardId) {
		return res.status(400).send({
			errors: [
				!title
					? {
							message: error.api.posts.titleMissing,
							code: "POST_TITLE_MISSING"
					  }
					: "",
				!boardId
					? {
							message: error.api.boards.boardIdMissing,
							code: "BOARD_ID_MISSING"
					  }
					: ""
			]
		});
	}

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

	try {
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

		const post = createPost[0];

		if (post) {
			// generate post unique indentification
			const voteId = uuidv4(post.postId);

			try {
				const createVote = await database
					.insert({
						voteId,
						userId: post.userId,
						postId: post.postId,
						createdAt: new Date().toJSON()
					})
					.into("votes")
					.returning("*");

				const vote = createVote[0];

				if (vote) {
					try {
						const findUser = await database
							.select("name", "username", "avatar")
							.from("users")
							.where({
								userId
							})
							.limit(1);

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
					} catch (err) {
						logger.log({
							level: "error",
							message: err
						});
					}
				}
			} catch (err) {
				logger.log({
					level: "error",
					message: err
				});
			}
		}
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
