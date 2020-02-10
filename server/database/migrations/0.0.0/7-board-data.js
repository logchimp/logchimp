// modules
const uuid = require("uuid");

const boardId = uuid();

exports.up = database => {
	return database.schema.raw(`
		INSERT INTO
			board(
				board_id,
				title,
				slug,
				hex_color
			)
		VALUES
			(
				${boardId},
				"No status",
				"no-status",
				"ea4aaa"
			),
			(
				${boardId},
				"Under Review",
				"under-review",
				"d73a49"
			),
			(
				${boardId},
				"Planned",
				"planned",
				"6f42c1"
			),
			(
				${boardId},
				"In Progress",
				"in-progress",
				"c5d928"
			),
			(
				${boardId},
				"Completed",
				"completed",
				"85b5b5"
			)
  );`);
};

exports.down = database => {
	return database.schema.raw(`DELETE FROM board;`);
};
