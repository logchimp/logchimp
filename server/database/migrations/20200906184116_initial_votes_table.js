exports.up = function(knex) {
	return knex.schema.createTable("votes", table => {
		table
			.uuid("voteId")
			.notNullable()
			.unique()
			.primary();
		table
			.uuid("userId")
			.references("userId")
			.inTable("users")
			.notNullable();
		table
			.uuid("postId")
			.references("postId")
			.inTable("posts")
			.onDelete("cascade")
			.notNullable();
		table.timestamp("createdAt", { useTz: true }).notNullable();
		table.comment("Storing post votes data");
	});
};

exports.down = function(knex) {
	return knex.schema.hasTable("votes").then(exists => {
		if (exists) {
			return knex.schema
				.alterTable("votes", table => {
					table.dropForeign("userId");
					table.dropForeign("postId");
				})
				.dropTable("votes");
		}
	});
};
