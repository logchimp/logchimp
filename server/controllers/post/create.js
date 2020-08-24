// modules
const { nanoid } = require("nanoid");
const { v4: uuidv4 } = require("uuid");

const database = require("../../database");

exports.create = (req, res) => {
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;
	const userId = req.body.userId;

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

	database
		.insert({
			postId,
			title,
			slug,
			slugId,
			contentMarkdown,
			userId,
			createdAt: new Date().toJSON(),
			updatedAt: new Date().toJSON()
		})
		.into("posts")
		.returning("*")
		.then(response => {
			const post = response[0];

			if (post) {
				res.status(201).send({
					status: {
						code: 201,
						type: "success"
					},
					post
				});
			}
		})
		.catch(error => {
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
		});
};
