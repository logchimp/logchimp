const {
	addPermissionWithRoles,
	removePermissionWithRoles
} = require("../utils");

exports.up = knex => {
	return Promise.all([
		addPermissionWithRoles(
			knex,
			{
				type: "setting",
				action: "read"
			},
			["administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "setting",
				action: "update"
			},
			["administrator", "owner"]
		)
	]);
};

exports.down = knex => {
	return Promise.all([
		removePermissionWithRoles(knex, {
			type: "setting",
			action: "read"
		}),
		removePermissionWithRoles(knex, {
			type: "setting",
			action: "update"
		})
	]);
};
