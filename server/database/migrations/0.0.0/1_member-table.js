exports.up = database => {
	return database.schema.raw(`
		CREATE TABLE member (
			member_id VARCHAR(80) PRIMARY KEY,
			first_name VARCHAR(30),
			last_name VARCHAR(30),
			email_address VARCHAR(320) UNIQUE NOT NULL,
			password VARCHAR(72) NOT NULL,
			profile_picture TEXT,
			is_verified BOOLEAN DEFAULT false,
			is_owner BOOLEAN DEFAULT false,
			is_moderator BOOLEAN DEFAULT false,
			is_blocked BOOLEAN DEFAULT false,
			created_at timestamp DEFAULT current_timestamp
  );`);
};

exports.down = database => {
	return database.schema.raw(`DROP TABLE member;`);
};
