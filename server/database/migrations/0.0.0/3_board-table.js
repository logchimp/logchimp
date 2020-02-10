exports.up = database => {
	return database.schema.raw(`
		CREATE TABLE IF NOT EXISTS board (
			board_id VARCHAR(80) PRIMARY KEY,
			title VARCHAR(100) NOT NULL,
			slug VARCHAR(150) NOT NULL,
			hex_color VARCHAR(6) NOT NULL,
			created_at timestamp DEFAULT current_timestamp
  );`);
};

exports.down = database => {
	return database.schema.raw(`DROP TABLE board;`);
};
