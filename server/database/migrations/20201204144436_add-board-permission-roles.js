const {
	addPermissionWithRoles,
	removePermissionWithRoles
} = require("../utils");

exports.up = knex => {
	return Promise.all([
		addPermissionWithRoles(
			knex,
			{
				type: "board",
				action: "create"
			},
			["manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "board",
				action: "read"
			},
			["ban", "user", "moderator", "manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "board",
				action: "update"
			},
			["manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "board",
				action: "destroy"
			},
			["manager", "administrator", "owner"]
		)
	]);
};

exports.down = knex => {
	return Promise.all([
		removePermissionWithRoles(knex, {
			type: "board",
			action: "create"
		}),
		removePermissionWithRoles(knex, {
			type: "board",
			action: "read"
		}),
		removePermissionWithRoles(knex, {
			type: "board",
			action: "update"
		}),
		removePermissionWithRoles(knex, {
			type: "board",
			action: "destroy"
		})
	]);
};
