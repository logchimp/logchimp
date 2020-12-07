const {
	addPermissionWithRoles,
	removePermissionWithRoles
} = require("../utils");

exports.up = knex => {
	return Promise.all([
		addPermissionWithRoles(
			knex,
			{
				type: "vote",
				action: "create"
			},
			["user", "moderator", "manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "vote",
				action: "destroy"
			},
			["user", "moderator", "manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "vote",
				action: "assign"
			},
			["manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "vote",
				action: "unassign"
			},
			["manager", "administrator", "owner"]
		)
	]);
};

exports.down = knex => {
	return Promise.all([
		removePermissionWithRoles(knex, {
			type: "vote",
			action: "create"
		}),
		removePermissionWithRoles(knex, {
			type: "vote",
			action: "destroy"
		}),
		removePermissionWithRoles(knex, {
			type: "vote",
			action: "assign"
		}),
		removePermissionWithRoles(knex, {
			type: "vote",
			action: "unassign"
		})
	]);
};
