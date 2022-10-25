const { v4: uuidv4 } = require("uuid");

// utils
const logger = require("../../utils/logger");

const everyoneRole = async (knex) => {
  return await knex("roles")
    .select("id")
    .where({
      name: "@everyone",
    })
    .first();
};

const getPermId = (list, perm) => {
  const type = perm.split(":")[0];
  const action = perm.split(":")[1];
  return list.find((item) => item.type === type && item.action === action).id;
};

exports.up = async (knex) => {
  try {
    const role = await everyoneRole(knex);
    const roleId = role.id;

    const permissions = await knex("permissions").select();

    await knex
      .insert([
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: getPermId(permissions, "post:create"),
        },
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: getPermId(permissions, "vote:create"),
        },
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: getPermId(permissions, "vote:destroy"),
        },
      ])
      .into("permissions_roles");

    logger.info({
      message: "Insert data: '@everyone' role permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: err.message,
    });
  }
};

exports.down = async (knex) => {
  try {
    const role = await everyoneRole(knex);
    const roleId = role.id;

    await knex("permissions_roles").delete().where({
      role_id: roleId,
    });

    logger.info({
      message: "Drop data: '@everyone' role permissions",
    });
  } catch (err) {
    logger.error({
      code: "DATABASE_SEEDS",
      message: err.message,
    });
  }
};
