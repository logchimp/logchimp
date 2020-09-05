// modules
const knex = require("knex")({
	client: "pg",
	// postgresql database version
	version: "12.4",
	connection: {
		host: process.env.PG_HOST,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE
	},
	afterCreate: (conn, done) => {
		// in this example we use pg driver's connection API
		conn.query('SET timezone="UTC";', err => {
			if (err) {
				// first query failed, return error and don't try to make next query
				done(err, conn);
			} else {
				// do the second query...
				conn.query("SELECT set_limit(0.01);", err => {
					// if err is not falsy, connection is discarded from pool
					// if connection aquire was triggered by a query the error is passed to query promise
					done(err, conn);
				});
			}
		});
	}
});

knex.schema.hasTable("users").then(exists => {
	if (!exists) {
		return knex.schema
			.createTable("users", table => {
				table
					.uuid("userId")
					.notNullable()
					.unique()
					.primary();
				table.string("firstname", 30);
				table.string("lastname", 30);
				table
					.string("emailAddress", 320)
					.notNullable()
					.unique();
				table.string("password", 72).notNullable();
				table
					.string("username", 30)
					.notNullable()
					.unique();
				table.text("avatar");
				table.boolean("isVerified").defaultTo(false);
				table.boolean("isOwner").defaultTo(false);
				table.boolean("isModerator").defaultTo(false);
				table.boolean("isBlocked").defaultTo(false);
				table.timestamp("createdAt", { useTz: true }).notNullable();
				table.timestamp("updatedAt", { useTz: true }).notNullable();
				table.comment("Storing users data");
			})
			.then(() => {
				console.log("Creating 'users' table");
			})
			.catch(error => {
				console.error(error);
			});
	} else {
		console.log("'Users' table already exist");
	}
});

knex.schema.hasTable("posts").then(exists => {
	if (!exists) {
		return knex.schema
			.createTable("posts", table => {
				table
					.uuid("postId")
					.notNullable()
					.unique()
					.primary();
				table.string("title", 100).notNullable();
				table
					.string("slug", 150)
					.notNullable()
					.unique();
				table.string("slugId", 20).notNullable();
				table.text("contentMarkdown");
				table.uuid("userId").notNullable();
				table.timestamp("createdAt", { useTz: true }).notNullable();
				table.timestamp("updatedAt", { useTz: true }).notNullable();
				table.comment("Storing posts data");
			})
			.then(() => {
				console.log("Creating 'posts' table");
			})
			.catch(error => {
				console.error(error);
			});
	} else {
		console.log("'Posts' table already exist");
	}
});

knex.schema.hasTable("votes").then(exists => {
	if (!exists) {
		return knex.schema
			.createTable("votes", table => {
				table
					.uuid("voteId")
					.notNullable()
					.unique()
					.primary();
				table.uuid("userId").notNullable();
				table.uuid("postId").notNullable();
				table.timestamp("createdAt", { useTz: true }).notNullable();
				table.comment("Storing post votes data");
			})
			.then(() => {
				console.log("Creating 'votes' table");
			})
			.catch(error => {
				console.error(error);
			});
	} else {
		console.log("'Votes' table already exist");
	}
});

module.exports = knex;
