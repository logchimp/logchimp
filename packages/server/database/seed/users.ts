import { v4 as uuidv4 } from "uuid";

import { hashPassword } from "../../utils/password";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export default async function seed(knex) {
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
}
