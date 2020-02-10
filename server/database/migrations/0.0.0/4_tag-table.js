exports.up = database => {
	return database.schema.raw(`
		CREATE TABLE IF NOT EXISTS tag (
			tag_id VARCHAR(80) PRIMARY KEY,
			name VARCHAR(30) NOT NULL,
			hex_color VARCHAR(6) NOT NULL,
			created_at timestamp DEFAULT current_timestamp
  );`);
};

exports.down = database => {
	return database.schema.raw(`DROP TABLE tag;`);
};
