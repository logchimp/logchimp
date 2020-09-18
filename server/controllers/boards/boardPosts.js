const database = require("../../database");

// services
const getBoardBySlug = require("../../services/boards/getBoardBySlug");
const getVotes = require("../../services/votes/getVotes");

exports.boardPosts = async (req, res) => {
	const slug = req.params.slug;
	const board = await getBoardBySlug(slug);

	/**
	 * top, latest, oldest, trending
	 */
	const created = req.query.created;
	const page = req.query.page - 1;
	const limit = req.query.limit || 10;
	try {
		if (board) {
			const posts = await database
				.select("postId", "title", "slug", "contentMarkdown", "createdAt")
				.from("posts")
				.where({
					boardId: board.boardId
				})
				.limit(limit)
				.offset(limit * page)
				.orderBy([
					{
						column: "createdAt",
						order: created
					}
				]);

			try {
				const postVoters = [];

				for (let i = 0; i < posts.length; i++) {
					const postId = posts[i].postId;
					const voters = await getVotes(postId);

					try {
						postVoters.push({
							...posts[i],
							voters
						});
					} catch (error) {
						console.error(error);
					}
				}

				res.status(200).send({
					status: {
						code: 200,
						type: "success"
					},
					posts: postVoters
				});
			} catch (error) {
				console.error(error);
			}
		} else {
			res.status(404).send({
				status: {
					code: 404,
					type: "error"
				},
				error: {
					code: "board_not_found",
					message: "Board not found"
				}
			});
		}
	} catch (error) {
		console.error(error);
	}
};
