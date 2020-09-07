require("dotenv").config({ path: "../.env" });

module.exports = {
	development: {
		client: "pg",
		connection: {
			host: process.env.PG_HOST,
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DATABASE,
			port: process.env.PG_PORT
		},
		migrations: {
			directory: "./database/migrations",
			tableName: "migrations"
		}
	},
	staging: {
		client: "pg",
		connection: {
			host: process.env.PG_HOST,
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DATABASE,
			port: process.env.PG_PORT,
			ssl: {
				rejectUnauthorized: false
			}
		},
		migrations: {
			directory: "./database/migrations",
			tableName: "migrations"
		}
	},
	production: {
		client: "pg",
		connection: {
			host: process.env.PG_HOST,
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DATABASE,
			port: process.env.PG_PORT,
			ssl: {
				rejectUnauthorized: false
			}
		},
		migrations: {
			directory: "./database/migrations",
			tableName: "migrations"
		}
	}
};
