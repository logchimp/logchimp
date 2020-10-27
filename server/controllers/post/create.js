// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

const database = require("../../database");

// services
const addVote = require("../../services/votes/create");

// utils
const logger = require("../../utils/logger");
const error = require("../../errorResponse.json");

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

		// add vote to post
		await addVote(userId, postId);

		res.status(201).send({
			...post
		});
	} catch (err) {
		logger.log({
			level: "error",
			message: err
		});
	}
};
