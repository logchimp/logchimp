const database = require("../database");

// utils
const error = require("../errorResponse");

module.exports = async (req, res, next) => {
	const id = req.body.id;
	const url = req.params.url;

	const roadmap = await database
		.select()
		.from("roadmaps")
		.where({
			id: id || null
		})
		.orWhere({
			url: url || null
		})
		.first();

	if (!roadmap) {
		return res.status(404).send({
			message: error.api.roadmaps.roadmapNotFound,
			code: "ROADMAP_NOT_FOUND"
		});
	}

	req.roadmap = roadmap;
	next();
};
