const {
	addPermissionWithRoles,
	removePermissionWithRoles
} = require("../utils");

exports.up = knex => {
	return Promise.all([
		addPermissionWithRoles(
			knex,
			{
				type: "post",
				action: "create"
			},
			["user", "moderator", "manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "post",
				action: "read"
			},
			["ban", "user", "moderator", "manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "post",
				action: "update"
			},
			["user", "moderator", "manager", "administrator", "owner"]
		),
		addPermissionWithRoles(
			knex,
			{
				type: "post",
				action: "destroy"
			},
			["manager", "administrator", "owner"]
		)
	]);
};

exports.down = knex => {
	return Promise.all([
		removePermissionWithRoles(knex, {
			type: "post",
			action: "create"
		}),
		removePermissionWithRoles(knex, {
			type: "post",
			action: "read"
		}),
		removePermissionWithRoles(knex, {
			type: "post",
			action: "update"
		}),
		removePermissionWithRoles(knex, {
			type: "post",
			action: "destroy"
		})
	]);
};
