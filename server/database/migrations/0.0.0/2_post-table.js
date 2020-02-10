exports.up = database => {
	return database.schema.raw(`
		CREATE TABLE IF NOT EXISTS post (
			post_id VARCHAR(80) PRIMARY KEY,
			title VARCHAR(100) NOT NULL,
			slug VARCHAR(150) NOT NULL,
			slug_id VARCHAR(8) NOT NULL,
			body_markdown TEXT,
			member_id VARCHAR(80) NOT NULL REFERENCES member(member_id),
			status VARCHAR(80) REFERENCES board(board_id),
			tag_id VARCHAR(80) REFERENCES tag(tag_id),
			voters VARCHAR [],
			created_at timestamp DEFAULT current_timestamp,
			updated_at timestamp DEFAULT current_timestamp
  );`);
};

exports.down = database => {
	return database.schema.raw(`DROP TABLE post;`);
};
