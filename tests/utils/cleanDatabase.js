const database = require("../../server/database");

// Not removing data from permissions table
module.exports = () =>
	database
		.raw(
			`
				DELETE FROM "emailVerification";
				DELETE FROM "resetPassword";
				DELETE FROM "posts_comments";
				DELETE FROM "posts_activity";
				DELETE FROM "permissions_roles";
				DELETE FROM "roles_users";
				DELETE FROM roles WHERE name != '@everyone';
				DELETE FROM "roadmaps";
				DELETE FROM "boards";
				DELETE FROM "votes";
				DELETE FROM "posts";
				DELETE FROM "users";
				DELETE FROM "settings";
			`
		)
		.then(() => {
			if (process.env.NODE_ENV !== "CI") {
				console.log("🚨 All data deleted!");
			}
		})
		.catch((err) => {
			console.log(err);
		});
