const { v4: uuidv4 } = require("uuid");

const { hashPassword } = require("../../helpers");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    {
      userId: uuidv4(),
      email: "user_exists@example.com",
      password: hashPassword("strongPassword"),
      username: "user_exists",
    },
    {
      userId: uuidv4(),
      email: "user_blocked@example.com",
      password: hashPassword("strongPassword"),
      username: "user_blocked",
      isBlocked: true,
    },
  ]);
};
