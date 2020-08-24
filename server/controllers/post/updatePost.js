const database = require("../../database");

exports.updatePost = (req, res) => {
	const postId = req.params.postId;
	const title = req.body.title;
	const contentMarkdown = req.body.contentMarkdown;
	const slugId = req.body.slugId;

	const slug = `${title
		.replace(/[^\w\s]/gi, "")
		.replace(/\s\s+/gi, " ")
		.toLowerCase()
		.split(" ")
		.join("-")}-${slugId}`;

	database
		.update({
			title,
			slug,
			contentMarkdown,
			updatedAt: new Date().toJSON()
		})
		.from("posts")
		.where({
			postId
		})
		.returning("*")
		.then(response => {
			const post = response[0];

			res.status(200).send({
				status: {
					code: 200,
					type: "success"
				},
				post
			});
		})
		.catch(error => {
			console.error(error);
		});
};
