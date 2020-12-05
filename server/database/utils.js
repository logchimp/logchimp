const { v4: uuidv4 } = require("uuid");

// utils
const logger = require("../utils/logger");

const addPermission = async (database, permission) => {
	const existingPermission = await database
		.select()
		.from("permissions")
		.where(permission)
		.first();

	if (existingPermission) {
		logger.warn({
			message: `Permission for ${permission.type}:${permission.action} already added`
		});
		return;
	}

	logger.info(`Adding permission for ${permission.type}:${permission.action}`);

	await database
		.insert({
			id: uuidv4(),
			type: permission.type,
			action: permission.action
		})
		.into("permissions");
};

const removePermission = async (database, permission) => {
	const existingPermission = await database
		.select()
		.from("permissions")
		.where(permission)
		.first();

	if (!existingPermission) {
		logger.warn({
			message: `Permission for ${permission.type}:${permission.action} already removed`
		});
		return;
	}

	logger.info(
		`Removing permission for ${permission.type}:${permission.action}`
	);

	await database
		.delete()
		.from("permissions")
		.where({
			type: permission.type,
			action: permission.action
		});
};

const addPermissionToRole = async (database, permission, roles) => {
	const getPermission = await database
		.select()
		.from("permissions")
		.where(permission)
		.first();

	if (!getPermission) {
		logger.error({
			message: `Permission (${permission.type}:${permission.action}) does not exist`
		});
		return;
	}

	roles.forEach(async role => {
		const getRole = await database
			.select()
			.from("roles")
			.where({
				name: role
			})
			.first();

		if (!getRole) {
			logger.error({
				message: `Role (${getRole}) does not exists`
			});
		}

		const existingRelation = await database
			.select()
			.from("permissions_roles")
			.where({
				permission_id: getPermission.id,
				role_id: getRole.id
			})
			.first();

		if (existingRelation) {
			logger.warn({
				message: `Adding permission(${permission.type}:${permission.action}) to role(${getRole.name}) - already exists`
			});
			return;
		}

		logger.warn({
			message: `Adding permission(${permission.type}:${permission.action}) to role(${getRole.name})`
		});

		await database
			.insert({
				id: uuidv4(),
				permission_id: getPermission.id,
				role_id: getRole.id
			})
			.into("permissions_roles");
	});
};

exports.addPermissionWithRoles = async (database, permission, roles) => {
	return (
		await addPermission(database, permission),
		await addPermissionToRole(database, permission, roles)
	);
};

exports.removePermissionWithRoles = (database, permission) => {
	return removePermission(database, permission);
};
