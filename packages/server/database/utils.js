import { v4 as uuidv4 } from "uuid";

// utils
import logger from "../utils/logger";

const permissionExists = async (database, permission) =>
  database
    .select()
    .from("permissions")
    .where({
      ...permission,
    })
    .first();

function addPermission(database, permissions) {
  return permissions.forEach(async (permission) => {
    const type = permission.split(":")[0];
    const action = permission.split(":")[1];

    const exists = await permissionExists(database, {
      type,
      action,
    });

    if (exists) {
      return logger.warn({
        message: `Permission ${type}:${action} already added`,
      });
    }

    await database
      .insert({
        id: uuidv4(),
        type,
        action,
      })
      .into("permissions");

    logger.info(`Adding permission ${type}:${action}`);
  });
}

async function removePermission(database, permissions) {
  return await permissions.forEach(async (permission) => {
    const type = permission.split(":")[0];
    const action = permission.split(":")[1];

    await database.delete().from("permissions").where({
      type,
      action,
    });

    logger.info(`Removing permission ${type}:${action}`);
  });
}

export { addPermission, removePermission };
