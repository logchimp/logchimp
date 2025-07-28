const { v4: uuid } = require("uuid");
const { faker } = require("@faker-js/faker");
const supertest = require("supertest");

const app = require("../../../app");
const database = require("../../../database");
const { hashPassword } = require("../../../utils/password");

/**
 * NOTE: this function by-passes 'allowSignup' settings
 * Should have `@everyone` role assigned.
 *
 * @param user
 */
const createUser = async (user = undefined) => {
  const userId = uuid();
  const email = user?.email || faker.internet.email();
  const username = email.split("@")[0];
  const password = user?.password || "password";
  const isVerified = user?.isVerified || false;
  const isBlocked = user?.isBlocked || false;

  // manually seeding data due to 'allowSignup' possibly be disabled
  await database
    .insert({
      userId,
      email,
      password: hashPassword(password),
      username,
      isVerified,
      isBlocked,
    })
    .into("users");

  // assign '@everyone' role to user
  await database.raw(
    `
        INSERT INTO roles_users (id, role_id, user_id)
        VALUES (:uuid, (SELECT id
                        FROM roles
                        WHERE name = '@everyone'), :userId)
    `,
    {
      uuid: uuid(),
      userId,
    },
  );

  const response = await supertest(app).post("/api/v1/auth/login").send({
    email,
    password,
  });

  return response.body;
};

module.exports = {
  createUser,
};
