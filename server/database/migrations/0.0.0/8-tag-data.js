// modules
const uuid = require("uuid");

const tagId = uuid();

exports.up = database => {
	return database.schema.raw(`
		INSERT INTO
			tag(
				tag_id,
				title,
				hex_color
			)
		VALUES
			(
				${tagId},
				"Improvement",
				"ea4aaa"
			),
			(
				${tagId},
				"Feature",
				"d73a49"
			),
			(
				${tagId},
				"Fix",
				"6f42c1"
			),
			(
				${tagId},
				"Optimization",
				"c5d928"
			)
  );`);
};

exports.down = database => {
	return database.schema.raw(`DELETE FROM tag;`);
};
