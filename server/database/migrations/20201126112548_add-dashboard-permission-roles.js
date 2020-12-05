const {
	addPermissionWithRoles,
	removePermissionWithRoles
} = require("../utils");

exports.up = knex => {
	return Promise.all([
		addPermissionWithRoles(
			knex,
			{
				type: "dashboard",
				action: "read"
			},
			["moderator", "manager", "administrator", "owner"]
		)
	]);
};

exports.down = knex => {
	return Promise.all([
		removePermissionWithRoles(knex, {
			type: "dashboard",
			action: "read"
		})
	]);
};
