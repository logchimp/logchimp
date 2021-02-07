const database = require("../../server/database");

const latest = async () => {
	return await database.migrate.latest();
};

const rollback = async () => {
	return await database.migrate.rollback();
};

module.exports = {
	instance: database,
	latest,
	rollback
};
