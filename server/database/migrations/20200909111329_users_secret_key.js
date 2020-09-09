const md5 = require("md5");

exports.up = function(knex) {
	return knex.schema
		.table("users", table => {
			table
				.string("secretKey", 40)
				.unique()
				.comment("Unique md5 hash using as jwt secret key");
		})
		.then(() => {
			knex
				.select()
				.from("users")
				.whereNull("secretKey")
				.then(response => {
					console.log(`Total record count: ${response.length}`);
					for (let i = 0; i < response.length; i++) {
						const user = response[i];
						const md5Hash = md5(user.userId);
						knex
							.update({
								secretKey: md5Hash
							})
							.from("users")
							.where({ userId: user.userId })
							.then(() => {
								console.log(`Update ${user.emailAddress}`);
							})
							.catch(error => {
								console.error(error);
							});
					}
				})
				.catch(error => {
					console.error(error);
				});
		})
		.catch(error => {
			console.error(error);
		});
};

exports.down = function(knex) {
	return knex.schema
		.hasColumn("users", "secretKey")
		.then(exists => {
			if (exists) {
				return knex.schema.table("users", table => {
					table.dropColumn("secretKey");
				});
			}
		})
		.catch(error => {
			console.error(error);
		});
};
