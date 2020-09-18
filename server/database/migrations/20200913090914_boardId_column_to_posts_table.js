exports.up = function(knex) {
	return knex.schema
		.table("posts", table => {
			table
				.uuid("boardId")
				.references("boardId")
				.inTable("boards");
		})
		.then(() => {
			console.log("Add 'boardId' column in 'posts' table.");
		})
		.catch(error => {
			console.error(error);
		});
};

exports.down = function(knex) {
	return knex.schema
		.hasColumn("posts", "boardId")
		.then(exists => {
			if (exists) {
				return knex.schema.table("posts", table => {
					table.dropColumn("boardId");
				});
			}
		})
		.then(() => {
			console.log("Remove 'boardId' column from 'posts' table.");
		})
		.catch(error => {
			console.error(error);
		});
};
