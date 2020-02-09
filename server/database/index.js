// modules
const knex = require('knex')({
	client: 'pg',
	// postgresql database version
	version: '12.1',
	connection: {
		host: process.env.PG_HOST,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE
	},
	afterCreate: function (conn, done) {
		// in this example we use pg driver's connection API
		conn.query('SET timezone="UTC";', function (err) {
			if (err) {
				// first query failed, return error and don't try to make next query
				done(err, conn);
			} else {
				// do the second query...
				conn.query('SELECT set_limit(0.01);', function (err) {
					// if err is not falsy, connection is discarded from pool
					// if connection aquire was triggered by a query the error is passed to query promise
					done(err, conn);
				});
			}
		});
	}
});

module.exports = knex;
